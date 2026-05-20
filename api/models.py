import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Text, Float, Integer, Boolean,
    DateTime, ForeignKey, LargeBinary
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from database import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_code = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(256), nullable=False)
    description = Column(Text, default="")
    categories = Column(JSONB, default=list)
    tech_specs = Column(JSONB, default=dict)
    img_urls = Column(JSONB, default=dict)
    price = Column(Float, nullable=True)
    source_url = Column(Text, nullable=True)

    images = relationship("ItemImage", back_populates="item", cascade="all, delete-orphan")
    cart_entries = relationship("CartItem", back_populates="item")


class ItemImage(Base):
    __tablename__ = "item_images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_id = Column(UUID(as_uuid=True), ForeignKey("items.id"), nullable=False)
    url = Column(Text, nullable=False)
    data = Column(LargeBinary, nullable=True)
    content_type = Column(String(64), default="image/jpeg")
    is_primary = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)

    item = relationship("Item", back_populates="images")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(256), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="user", cascade="all, delete-orphan")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(32), default="completed")  # completed | processing | shipped | cancelled
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    shipping = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    shipping_address = Column(JSONB, default=dict)

    user = relationship("User", back_populates="invoices")
    line_items = relationship("InvoiceItem", back_populates="invoice", cascade="all, delete-orphan")


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id"), nullable=False)
    item_id = Column(UUID(as_uuid=True), ForeignKey("items.id"), nullable=True)
    product_code = Column(String(64), nullable=False)
    name = Column(String(256), nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    primary_image_id = Column(UUID(as_uuid=True), nullable=True)

    invoice = relationship("Invoice", back_populates="line_items")
    item = relationship("Item")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    item_id = Column(UUID(as_uuid=True), ForeignKey("items.id"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="cart_items")
    item = relationship("Item", back_populates="cart_entries")
