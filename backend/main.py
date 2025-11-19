"""
FastAPI backend for InvenTree stock management system.
Provides endpoints for item retrieval, stock removal, and image proxying.
"""

from io import BytesIO

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

from inventree_client import remove_stock, get_stock_from_qrid, get_item_details

load_dotenv()

app = FastAPI(title="InvenTree Stock Management API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Request Models ====================


class TakeItemRequest(BaseModel):
    """Request model for removing items from stock."""

    itemId: int
    quantity: int = 1
    notes: str = "Removed via API"


class BarcodeRequest(BaseModel):
    """Request model for QR/barcode lookup."""

    qr_id: str


class ItemDetailsRequest(BaseModel):
    """Request model for item details lookup."""

    item_id: int


# ==================== Endpoints ====================


@app.post("/take-item")
def take_item(data: TakeItemRequest) -> dict:
    """Remove stock from inventory."""
    response = remove_stock(data.itemId, data.quantity, data.notes)
    return response


@app.post("/get-item-from-qr")
def get_item_from_qr(data: BarcodeRequest) -> dict:
    """Get item info from a QR/barcode."""
    response = get_stock_from_qrid(data.qr_id)
    return response


@app.post("/get-item-name")
def get_item_name(data: ItemDetailsRequest) -> dict:
    """Get item details by ID."""
    response = get_item_details(data.item_id)
    return response
