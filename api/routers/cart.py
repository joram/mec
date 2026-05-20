from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user
from database import get_db
from routers.items import _item_to_summary

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("", response_model=schemas.CartOut)
def get_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    cart_items = (
        db.query(models.CartItem)
        .filter(models.CartItem.user_id == current_user.id)
        .all()
    )
    out = [
        schemas.CartItemOut(
            id=ci.id,
            item_id=ci.item_id,
            quantity=ci.quantity,
            item=_item_to_summary(ci.item),
        )
        for ci in cart_items
    ]
    return schemas.CartOut(items=out, total_items=sum(ci.quantity for ci in cart_items))


@router.post("", response_model=schemas.CartItemOut, status_code=201)
def add_to_cart(
    payload: schemas.CartItemAdd,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = db.query(models.Item).filter(models.Item.id == payload.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    existing = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.user_id == current_user.id,
            models.CartItem.item_id == payload.item_id,
        )
        .first()
    )
    if existing:
        existing.quantity += payload.quantity
        db.commit()
        db.refresh(existing)
        return schemas.CartItemOut(
            id=existing.id,
            item_id=existing.item_id,
            quantity=existing.quantity,
            item=_item_to_summary(existing.item),
        )

    cart_item = models.CartItem(
        user_id=current_user.id,
        item_id=payload.item_id,
        quantity=payload.quantity,
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return schemas.CartItemOut(
        id=cart_item.id,
        item_id=cart_item.item_id,
        quantity=cart_item.quantity,
        item=_item_to_summary(cart_item.item),
    )


@router.patch("/{cart_item_id}", response_model=schemas.CartItemOut)
def update_cart_item(
    cart_item_id: UUID,
    payload: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ci = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.id == cart_item_id,
            models.CartItem.user_id == current_user.id,
        )
        .first()
    )
    if not ci:
        raise HTTPException(status_code=404, detail="Cart item not found")
    ci.quantity = payload.quantity
    db.commit()
    db.refresh(ci)
    return schemas.CartItemOut(
        id=ci.id,
        item_id=ci.item_id,
        quantity=ci.quantity,
        item=_item_to_summary(ci.item),
    )


@router.delete("/{cart_item_id}", status_code=204)
def remove_from_cart(
    cart_item_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ci = (
        db.query(models.CartItem)
        .filter(
            models.CartItem.id == cart_item_id,
            models.CartItem.user_id == current_user.id,
        )
        .first()
    )
    if not ci:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(ci)
    db.commit()


@router.delete("", status_code=204)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db.query(models.CartItem).filter(
        models.CartItem.user_id == current_user.id
    ).delete()
    db.commit()
