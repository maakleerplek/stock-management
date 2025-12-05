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

from inventree_client import remove_stock, get_stock_from_qrid, get_item_details, api, INVENTREE_SITE_URL, add_stock

load_dotenv()

INVENTREE_PROXY_INTERNAL_URL = os.getenv("INVENTREE_PROXY_INTERNAL_URL", "http://inventree-proxy")

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
    notes = data.notes.replace("Removed", "Added")
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


@app.get("/image-proxy/{image_path:path}")
async def image_proxy(image_path: str):
    """
    Proxy image requests to the InvenTree server with authentication.
    Uses the Caddy reverse proxy which handles authentication properly.
    
    CRITICAL: This endpoint is essential for displaying images in the frontend.
    Do NOT modify without thorough testing. The key aspects:
    
    1. Uses INVENTREE_PROXY_INTERNAL_URL (Caddy reverse proxy)
       - Routes: Frontend → Backend → Caddy → InvenTree
       - Caddy handles auth, media serving, and proper headers
       
    2. Uses api.session.get() for authenticated requests
       - Session already has Authorization token and Host headers
       - Follows proper HTTP redirects (allow_redirects=True)
       
    3. Streams response in chunks (chunk_size=8192)
       - Efficient for large images
       - Prevents memory issues
       
    4. Sets proper CORS headers for cross-origin requests
       - Allows frontend to access the image proxy
    
    If images don't display in frontend, check:
    - INVENTREE_PROXY_INTERNAL_URL in .env (should be http://inventree-proxy)
    - Caddy container is running (docker ps should show inventree-proxy)
    - Backend logs show "Successfully fetched image" with Content-Type
    """
    try:
        # Construct the full URL to the image on the InvenTree server
        # The image_path already includes "media/"
        full_inventree_image_url = urljoin(INVENTREE_PROXY_INTERNAL_URL, image_path)

        print(f"DEBUG: Proxying image request to: {full_inventree_image_url}")

        # Make an authenticated request to the InvenTree server for the image
        # Using api.session which has proper auth headers already set up
        response = api.session.get(full_inventree_image_url, stream=True)
        response.raise_for_status()

        # Log response info
        print(f"DEBUG: Successfully fetched image")
        print(f"  Status: {response.status_code}")
        print(f"  Content-Type: {response.headers.get('Content-Type', 'Not set')}")
        print(f"  Content-Length: {response.headers.get('Content-Length', 'Not set')}")

        # Determine content type
        content_type = response.headers.get("Content-Type", "application/octet-stream")

        return StreamingResponse(
            response.iter_content(chunk_size=8192),
            media_type=content_type,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Content-Disposition": f"inline; filename={os.path.basename(image_path)}"
            }
        )
    except requests.exceptions.RequestException as e:
        print(f"Error in image_proxy RequestException: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch image from InvenTree: {e}")
    except Exception as e:
        print(f"Error in image_proxy: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
