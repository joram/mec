"""
Seed script: loads MEC items from the joram/items package into PostgreSQL.
Images are downloaded and stored as binary blobs in the DB.

Reads the JSON files from the installed 'items' package directly so we avoid
importing items.item (which pulls in the heavy quantulum3 NLP library).

Run via: docker compose --profile seed run --rm seed
"""
import importlib.util
import json
import os
import random
import sys
import logging
import httpx
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://mec:mec@localhost:5432/mec")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def wait_for_db(retries=20):
    import time
    for i in range(retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            log.info("Database ready")
            return
        except Exception:
            log.info(f"Waiting for DB... ({i+1}/{retries})")
            time.sleep(3)
    log.error("Could not connect to DB")
    sys.exit(1)


def find_items_data_dir() -> Path:
    """Locate the 'items/items/mec' directory inside the installed package."""
    spec = importlib.util.find_spec("items")
    if spec is None or not spec.origin:
        raise RuntimeError("'items' package not installed")
    pkg_dir = Path(spec.origin).parent  # .../site-packages/items/
    mec_dir = pkg_dir / "items" / "mec"
    if not mec_dir.is_dir():
        raise RuntimeError(f"MEC data directory not found at {mec_dir}")
    return mec_dir


def load_mec_items(mec_dir: Path):
    """Yield dicts straight from the JSON files — no quantulum3 needed."""
    for path in sorted(mec_dir.glob("*.json")):
        try:
            with path.open() as f:
                yield json.load(f)
        except Exception as e:
            log.warning(f"Skipping {path.name}: {e}")


def download_image(url: str, client: httpx.Client) -> tuple[bytes, str]:
    try:
        resp = client.get(url, timeout=15, follow_redirects=True)
        resp.raise_for_status()
        content_type = resp.headers.get("content-type", "image/jpeg").split(";")[0].strip()
        return resp.content, content_type
    except Exception as e:
        log.warning(f"Failed to download {url}: {e}")
        return b"", "image/jpeg"


def seed():
    wait_for_db()

    from database import Base
    Base.metadata.create_all(bind=engine)

    from models import Item as ItemModel, ItemImage

    db = SessionLocal()
    existing_count = db.query(ItemModel).count()
    if existing_count > 0:
        log.info(f"Database already has {existing_count} items — skipping seed.")
        db.close()
        return

    mec_dir = find_items_data_dir()
    all_items = list(load_mec_items(mec_dir))
    log.info(f"Found {len(all_items)} MEC items in {mec_dir}")

    http_client = httpx.Client(
        headers={"User-Agent": "MEC-Store/1.0"},
        timeout=30,
    )

    seeded = 0
    for data in all_items:
        product_code = data.get("product_code") or data.get("sku", "")
        if not product_code:
            continue

        existing = db.query(ItemModel).filter(ItemModel.product_code == product_code).first()
        if existing:
            continue

        img_urls = data.get("img_urls", {})
        if not isinstance(img_urls, dict):
            img_urls = {}

        price = _estimate_price(
            categories=data.get("categories") or [],
            name=data.get("name") or "",
        )

        db_item = ItemModel(
            product_code=product_code,
            name=data.get("name", ""),
            description=data.get("description", ""),
            categories=data.get("categories") or [],
            tech_specs=data.get("tech_specs") or {},
            img_urls=img_urls,
            price=price,
            source_url=data.get("source_url"),
        )
        db.add(db_item)
        db.flush()

        # Download and store images (low-res urls preferred, fall back to high)
        low_urls = img_urls.get("low") or img_urls.get("high") or []
        for i, url in enumerate(low_urls[:4]):
            log.info(f"  [{seeded+1}/{len(all_items)}] image {i+1}: {url[:60]}…")
            img_data, content_type = download_image(url, http_client)
            db.add(ItemImage(
                item_id=db_item.id,
                url=url,
                data=img_data or None,
                content_type=content_type,
                is_primary=(i == 0),
                sort_order=i,
            ))

        db.commit()
        seeded += 1
        log.info(f"Seeded [{seeded}/{len(all_items)}]: {data.get('name', product_code)}")

    http_client.close()
    db.close()
    log.info(f"Done! Seeded {seeded} items.")


def _estimate_price(categories: list, name: str) -> float:
    combined = " ".join(categories).lower() + " " + name.lower()
    price_map = [
        (["tent", "tents"], (300, 900)),
        (["sleeping bag", "sleep system"], (150, 600)),
        (["kayak", "canoe", "paddle"], (400, 1500)),
        (["boot", "boots", "shoe", "footwear"], (100, 280)),
        (["jacket", "coat", "parka"], (120, 500)),
        (["pack", "backpack", "rucksack"], (80, 350)),
        (["helmet"], (60, 200)),
        (["bike", "bicycle", "cycling"], (200, 2500)),
        (["glove", "mitt"], (30, 100)),
        (["sock"], (15, 40)),
        (["toque", "hat", "beanie"], (20, 60)),
        (["headlamp", "flashlight"], (25, 120)),
        (["stove", "cooking"], (40, 200)),
        (["water bottle", "flask", "hydration"], (15, 60)),
        (["rope", "climbing", "harness", "carabiner"], (20, 250)),
    ]
    for keywords, (low, high) in price_map:
        if any(kw in combined for kw in keywords):
            return round(random.uniform(low, high), 2)
    return round(random.uniform(20, 200), 2)


if __name__ == "__main__":
    seed()
