import random
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user
from database import get_db

router = APIRouter(prefix="/invoices", tags=["invoices"])

_STATUSES = ["completed", "completed", "completed", "shipped", "processing", "cancelled"]

_ADDRESSES = [
    {"name": "Home", "line1": "123 Main St", "city": "Vancouver", "province": "BC", "postal": "V6B 1A1"},
    {"name": "Home", "line1": "456 Oak Ave", "city": "Toronto", "province": "ON", "postal": "M5V 2T6"},
    {"name": "Home", "line1": "789 Pine Rd", "city": "Calgary", "province": "AB", "postal": "T2P 3C5"},
]


@router.get("", response_model=list[schemas.InvoiceSummary])
def list_invoices(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    invoices = (
        db.query(models.Invoice)
        .filter(models.Invoice.user_id == current_user.id)
        .order_by(models.Invoice.created_at.desc())
        .all()
    )
    return [
        schemas.InvoiceSummary(
            id=inv.id,
            created_at=inv.created_at,
            status=inv.status,
            total=inv.total,
            item_count=sum(li.quantity for li in inv.line_items),
        )
        for inv in invoices
    ]


@router.get("/{invoice_id}", response_model=schemas.InvoiceDetail)
def get_invoice(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    inv = (
        db.query(models.Invoice)
        .filter(models.Invoice.id == invoice_id, models.Invoice.user_id == current_user.id)
        .first()
    )
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return inv


@router.post("/seed-fake", response_model=list[schemas.InvoiceSummary], status_code=201)
def seed_fake_invoices(
    count: int = 5,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Generate `count` realistic fake invoices for the current user."""
    items_pool = (
        db.query(models.Item)
        .filter(models.Item.price.isnot(None))
        .order_by(models.Item.id)  # stable order, not random at DB level
        .limit(500)
        .all()
    )
    if not items_pool:
        raise HTTPException(status_code=422, detail="No items in database — run the seed first.")

    created = []
    for _ in range(max(1, min(count, 20))):
        # Pick 1–6 random items
        line_count = random.randint(1, 6)
        chosen = random.sample(items_pool, min(line_count, len(items_pool)))

        line_items = []
        for item in chosen:
            qty = random.randint(1, 3)
            primary_img = next(
                (img.id for img in item.images if img.is_primary),
                item.images[0].id if item.images else None,
            )
            line_items.append(
                models.InvoiceItem(
                    item_id=item.id,
                    product_code=item.product_code,
                    name=item.name,
                    price=item.price,
                    quantity=qty,
                    primary_image_id=primary_img,
                )
            )

        subtotal = round(sum(li.price * li.quantity for li in line_items), 2)
        tax = round(subtotal * 0.12, 2)          # 12% GST+PST
        shipping = 0.0 if subtotal >= 50 else 9.95
        total = round(subtotal + tax + shipping, 2)

        # Random date in the past year
        days_ago = random.randint(1, 365)
        created_at = datetime.utcnow() - timedelta(days=days_ago)

        invoice = models.Invoice(
            user_id=current_user.id,
            created_at=created_at,
            status=random.choice(_STATUSES),
            subtotal=subtotal,
            tax=tax,
            shipping=shipping,
            total=total,
            shipping_address=random.choice(_ADDRESSES),
            line_items=line_items,
        )
        db.add(invoice)
        db.flush()
        created.append(invoice)

    db.commit()
    for inv in created:
        db.refresh(inv)

    return [
        schemas.InvoiceSummary(
            id=inv.id,
            created_at=inv.created_at,
            status=inv.status,
            total=inv.total,
            item_count=sum(li.quantity for li in inv.line_items),
        )
        for inv in created
    ]
