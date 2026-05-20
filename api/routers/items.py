from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

import models
import schemas
from database import get_db

router = APIRouter(prefix="/items", tags=["items"])


def _primary_image_id(item: models.Item) -> Optional[UUID]:
    if not item.images:
        return None
    primary = next((img for img in item.images if img.is_primary), None)
    if primary:
        return primary.id
    return item.images[0].id if item.images else None


def _item_to_summary(item: models.Item) -> schemas.ItemSummary:
    return schemas.ItemSummary(
        id=item.id,
        product_code=item.product_code,
        name=item.name,
        categories=item.categories or [],
        price=item.price,
        primary_image_id=_primary_image_id(item),
    )


@router.get("", response_model=schemas.ItemsPage)
def list_items(
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(models.Item)
    if category:
        q = q.filter(models.Item.categories.contains([category]))
    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return schemas.ItemsPage(
        items=[_item_to_summary(i) for i in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/search", response_model=schemas.ItemsPage)
def search_items(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db),
):
    term = f"%{q.lower()}%"
    query = db.query(models.Item).filter(
        or_(
            func.lower(models.Item.name).like(term),
            func.lower(models.Item.description).like(term),
            func.lower(models.Item.product_code).like(term),
        )
    )
    total = query.count()
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    return schemas.ItemsPage(
        items=[_item_to_summary(i) for i in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/categories", response_model=list[str])
def list_categories(db: Session = Depends(get_db)):
    items = db.query(models.Item.categories).all()
    categories = set()
    for (cats,) in items:
        if cats:
            for c in cats:
                categories.add(c)
    return sorted(categories)


@router.get("/{item_id}", response_model=schemas.ItemDetail)
def get_item(item_id: UUID, db: Session = Depends(get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@router.get("/{item_id}/images/{image_id}")
def get_image(item_id: UUID, image_id: UUID, db: Session = Depends(get_db)):
    image = (
        db.query(models.ItemImage)
        .filter(models.ItemImage.id == image_id, models.ItemImage.item_id == item_id)
        .first()
    )
    if not image or not image.data:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(content=image.data, media_type=image.content_type)
