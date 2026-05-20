from __future__ import annotations
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr


# ── Items ────────────────────────────────────────────────────────────────────

class ItemImageOut(BaseModel):
    id: UUID
    url: str
    is_primary: bool
    sort_order: int

    model_config = {"from_attributes": True}


class ItemSummary(BaseModel):
    id: UUID
    product_code: str
    name: str
    categories: List[str]
    price: Optional[float]
    primary_image_id: Optional[UUID] = None

    model_config = {"from_attributes": True}


class ItemDetail(BaseModel):
    id: UUID
    product_code: str
    name: str
    description: str
    categories: List[str]
    tech_specs: Dict[str, Any]
    img_urls: Dict[str, Any]
    price: Optional[float]
    source_url: Optional[str]
    images: List[ItemImageOut]

    model_config = {"from_attributes": True}


class ItemsPage(BaseModel):
    items: List[ItemSummary]
    total: int
    page: int
    page_size: int


# ── Auth ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: UUID
    username: str
    email: str

    model_config = {"from_attributes": True}


# ── Cart ─────────────────────────────────────────────────────────────────────

class CartItemAdd(BaseModel):
    item_id: UUID
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemOut(BaseModel):
    id: UUID
    item_id: UUID
    quantity: int
    item: ItemSummary

    model_config = {"from_attributes": True}


class CartOut(BaseModel):
    items: List[CartItemOut]
    total_items: int
