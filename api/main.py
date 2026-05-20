from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import items, auth, cart, invoices

Base.metadata.create_all(bind=engine)

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
