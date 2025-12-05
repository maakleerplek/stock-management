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
from urllib.parse import urljoin

from inventree_client import remove_stock, get_stock_from_qrid, get_item_details, api, INVENTREE_SITE_URL, INVENTREE_URL, INVENTREE_TOKEN, add_stock

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


@app.post("/add-item")
def add_item(data: TakeItemRequest) -> dict:
    """Add stock to inventory."""
    notes = data.notes.replace("Removed via API", "Added via API")
    response = add_stock(data.itemId, data.quantity, notes)
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


@app.options("/image-proxy/{image_path:path}")
async def image_proxy_options(image_path: str):
    """
    Handle CORS preflight requests for image proxy.
    """
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }


@app.get("/image-proxy/{image_path:path}")
async def image_proxy(image_path: str):
    """
    Proxy image requests to the InvenTree server with authentication.
    """
    try:
        # Construct the full URL to the image on the InvenTree server
        base_url = INVENTREE_URL.rstrip('/')
        image_path_clean = image_path.lstrip('/')
        full_inventree_image_url = f"{base_url}/{image_path_clean}"

        print(f"DEBUG: Requesting image from: {full_inventree_image_url}")
        
        # Make a direct request with proper authentication
        from inventree_client import INVENTREE_SITE_URL as SITE_URL
        host_header = SITE_URL.replace("http://", "").replace("https://", "").split(':')[0]
        
        headers = {
            "Authorization": f"Token {INVENTREE_TOKEN}",
            "Host": host_header,
        }
        
        response = requests.get(full_inventree_image_url, headers=headers, stream=True, allow_redirects=True)
        
        print(f"DEBUG: Response status: {response.status_code}")
        print(f"DEBUG: Response content-type: {response.headers.get('Content-Type')}")
        
        response.raise_for_status()

        # Determine content type - infer from URL if response is HTML
        content_type = response.headers.get("Content-Type", "application/octet-stream")
        if "text/html" in content_type:
            # InvenTree returned HTML, likely an error page. Try to infer from filename
            if image_path.endswith('.jpeg') or image_path.endswith('.jpg'):
                content_type = "image/jpeg"
            elif image_path.endswith('.png'):
                content_type = "image/png"
            elif image_path.endswith('.gif'):
                content_type = "image/gif"
            elif image_path.endswith('.webp'):
                content_type = "image/webp"
            else:
                content_type = "image/jpeg"  # default to jpeg
            print(f"DEBUG: Corrected content-type to: {content_type}")

        return StreamingResponse(
            response.iter_content(chunk_size=8192),
            media_type=content_type,
            headers={
                "Content-Disposition": f"inline; filename={os.path.basename(image_path)}",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
                "Cache-Control": "public, max-age=3600"
            }
        )
    except requests.exceptions.RequestException as e:
        print(f"Error fetching image from InvenTree: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch image from InvenTree: {e}")
    except Exception as e:
        print(f"Unexpected error in image proxy: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

