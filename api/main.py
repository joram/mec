from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from database import Base, engine, SessionLocal
from routers import items, auth, cart, invoices
from models import Item, ItemImage

log = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)


def seed_default_items():
  """Seed database with sample items if empty."""
  db = SessionLocal()
  try:
    existing = db.query(Item).count()
    if existing > 0:
      log.info(f"Database has {existing} items, skipping seed")
      return

    log.info("Database is empty, seeding with sample items...")

    sample_items = [
      {
        "product_code": "0101-022",
        "name": "Fox 40 Classic Whistle",
        "description": "Extremely loud whistle. Pealess with no moving parts. Waterproof with lanyard. Produces 115 dB.",
        "categories": ["Safety", "Whistles", "Camping"],
        "price": 29.99,
        "tech_specs": {"Decibels": ["115dB"], "Weight": ["20g"]},
        "img_urls": {},
      },
      {
        "product_code": "0102-350",
        "name": "Duracell D Battery (2 Pack)",
        "description": "Reliable alkaline batteries for outdoor equipment.",
        "categories": ["Electronics", "Batteries", "Power"],
        "price": 12.99,
        "tech_specs": {"Type": ["D"], "Chemistry": ["Alkaline"]},
        "img_urls": {},
      },
      {
        "product_code": "0102-665",
        "name": "Maglite AA Flashlight",
        "description": "High-quality flashlight with focusable beam. Anodized aluminum. Includes 2 AA batteries.",
        "categories": ["Lighting", "Flashlights", "Camping"],
        "price": 45.99,
        "tech_specs": {"Batteries": ["2 AA"], "Burn time": ["5.5h"]},
        "img_urls": {},
      },
      {
        "product_code": "0106-070",
        "name": "Coghlan's Folding Scissors",
        "description": "Compact folding scissors for hiking and camping. Stainless steel blades.",
        "categories": ["Tools", "Accessories", "Camping"],
        "price": 9.99,
        "tech_specs": {"Weight": ["35g"], "Material": ["Stainless Steel"]},
        "img_urls": {},
      },
      {
        "product_code": "0199-034",
        "name": "Coghlan's Emergency Blanket",
        "description": "Lightweight emergency blanket. Reflects heat. Fits in pocket.",
        "categories": ["Safety", "Emergency", "Survival"],
        "price": 7.99,
        "tech_specs": {"Weight": ["55g"], "Size": ["2.1m x 1.35m"]},
        "img_urls": {},
      },
      {
        "product_code": "0199-463",
        "name": "Pelican 1200 Case",
        "description": "Waterproof protective case. Crushproof design. Great for cameras and electronics.",
        "categories": ["Gear", "Cases", "Protection"],
        "price": 119.99,
        "tech_specs": {"Size": ["27 x 24.6 x 12.3 cm"], "Material": ["ABS"]},
        "img_urls": {},
      },
    ]

    for item_data in sample_items:
      item = Item(**item_data)
      db.add(item)

    db.commit()
    log.info(f"✓ Seeded {len(sample_items)} sample items")
  except Exception as e:
    log.error(f"Error seeding database: {e}")
    db.rollback()
  finally:
    db.close()


seed_default_items()

app = FastAPI(title="MEC API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(items.router)
app.include_router(auth.router)
app.include_router(cart.router)
app.include_router(invoices.router)


@app.get("/health")
def health():
    return {"status": "ok"}
