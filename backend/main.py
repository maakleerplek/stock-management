# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from inventree_client import remove_stock, get_stock_from_qrid, get_item_details

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your frontend URL if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request models ---
class TakeItemRequest(BaseModel):
    itemId: int
    quantity: int = 1
    notes: str = "Removed via API"

class BarcodeRequest(BaseModel):
    qr_id: str

class ItemDetailsRequest(BaseModel):
    item_id: int

# --- Endpoints ---
@app.post("/take-item")
def take_item(data: TakeItemRequest):
    """
    Remove stock from inventory
    """
    response = remove_stock(data.itemId, data.quantity, data.notes)
    return response


@app.post("/get-item-from-qr")
def get_item_from_qr(data: BarcodeRequest):
    """
    Get item info from a QR/barcode
    """
    response = get_stock_from_qrid(data.qr_id)
    return response


@app.post("/get-item-name")
def get_item_name(data: ItemDetailsRequest):
    """
    Get item details by ID (name, quantity, description)
    """
    response = get_item_details(data.item_id)
    return response
