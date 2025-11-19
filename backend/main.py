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


@app.get("/api/proxy/part/{part_id}")
def proxy_image(part_id: int) -> StreamingResponse:
    """
    Proxy InvenTree part thumbnail images to frontend using the correct API endpoint.
    
    Uses the InvenTree API endpoint /api/part/thumbs/{id}/ with proper authentication.
    """
    token = os.getenv("INVENTREE_TOKEN")
    base_url = os.getenv("INVENTREE_URL")
    site_url = os.getenv("INVENTREE_SITE_URL", "localhost")
    
    if not token or not base_url:
        raise HTTPException(status_code=500, detail="Missing InvenTree credentials")
    
    try:
        # Use the correct InvenTree API endpoint for thumbnails
        full_image_url = f"{base_url}/api/part/thumbs/{part_id}/"
        
        print(f"Proxying part thumbnail from: {full_image_url}")
        
        # Use Host header spoofing like in InvenTreeClient to bypass SITE_URL validation
        headers = {
            "Authorization": f"Token {token}",
            "Host": site_url,
        }
        
        response = requests.get(full_image_url, headers=headers, stream=True, timeout=10)
        
        if response.status_code != 200:
            print(f"Image fetch failed with status {response.status_code}")
            print(f"Response text (first 300 chars): {response.text[:300]}")
            raise HTTPException(status_code=response.status_code, detail=f"Image not found: {response.status_code}")
        
        return StreamingResponse(
            BytesIO(response.content),
            media_type=response.headers.get("Content-Type", "image/png"),
        )
        
    except requests.RequestException as e:
        print(f"Request error fetching image: {e}")
        raise HTTPException(status_code=502, detail="Failed to fetch image from InvenTree")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in proxy_image: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")