# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from inventree_client import remove_stock, get_stock_from_qrid, get_item_details
import requests
import os
from io import BytesIO
from dotenv import load_dotenv

load_dotenv()


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

@app.get("/api/proxy/{image_url:path}")
def part_image(image_url: str):
    """
    Proxy for InvenTree images.
    Frontend calls /api/proxy/<media/...>, FastAPI fetches from InvenTree with auth.
    """
    headers = {"Authorization": f"Token {os.getenv('INVENTREE_TOKEN')}"}
    print(image_url)
    image_url = image_url.removesuffix("/api/")
    full_image_url = f"{os.getenv('INVENTREE_URL')}/{image_url.lstrip('/')}"  # ensure no double slashes

    print("Fetching:", full_image_url)  # <-- debug print

    img_resp = requests.get(full_image_url, headers=headers, stream=True)

    if img_resp.status_code != 200:
        raise HTTPException(status_code=img_resp.status_code, detail="Image not found")

    return StreamingResponse(
        BytesIO(img_resp.content),
        media_type=img_resp.headers.get("Content-Type", "image/png")
    )