"""
FastAPI backend for InvenTree stock management system.
Provides endpoints for item retrieval, stock removal, and image proxying.
"""

from io import BytesIO

from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv
from urllib.parse import urljoin
from typing import Optional

from inventree_client import remove_stock, get_stock_from_qrid, get_item_details, api, INVENTREE_SITE_URL, add_stock, create_part, create_stock_item, upload_image_to_part

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


class CreatePartRequest(BaseModel):
    """Request model for creating a new part."""
    partName: str
    ipn: str = "" # Add ipn field
    description: str = ""
    # Removed from initial creation
    # category: str
    initialQuantity: float = 0 # Initial quantity for stock item to be created with part

    # unit: str = "" # Removed
    # Removed from initial creation
    # storageLocation: str
    # supplier: str = "" # Removed
    # notes: str = "" # Removed

class UpdatePartRequest(BaseModel):
    """Request model for updating an existing part."""
    category: str
    storageLocation: str
    barcode: str = ""


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


@app.post("/create-part")
async def create_part_endpoint(data: CreatePartRequest) -> dict:
    """Create a new part in inventory and optionally add initial stock."""
    try:
        # Note: category, default_location are now handled in update_part_endpoint
        # For now, assume they are sent as appropriate types or handle potential
        # None/empty string values for optional fields.
        
        # supplier is now handled in the update step

        
        part_ipn = data.ipn if data.ipn else f"TEMP-{data.partName}-{os.urandom(4).hex()}"

        part_creation_response = create_part(
            name=data.partName,
            ipn=part_ipn,
            description=data.description,
            # category is now set in the update step
            # units is now set in the update step
            # default_location is now set in the update step
            # default_supplier is not directly supported in create_part for inventree_client
            # notes is now set in the update step
        )

        if part_creation_response.get("status") == "error":
            raise HTTPException(status_code=500, detail=part_creation_response.get("message"))

        created_part = part_creation_response.get("part")
        part_pk = created_part.get("pk")

        
        return {
            "status": "ok",
            "message": "Part created successfully",
            "partId": part_pk, # Return partId for the frontend to use in the next step
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error creating part: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create part: {e}")


@app.patch("/update-part/{part_pk}")
async def update_part_endpoint(part_pk: int, data: UpdatePartRequest) -> dict:
    """Update an existing part in inventory."""
    try:
        # Convert category and storageLocation to int if they are not empty
        category_id = int(data.category) if data.category else None
        location_id = int(data.storageLocation) if data.storageLocation else None

        update_payload = {}
        
        # Only add fields that are not None
        if category_id is not None:
            update_payload["category"] = category_id
        if location_id is not None:
            update_payload["default_location"] = location_id

        # Update the part only if we have data to update
        if update_payload:
            part_update_response = api.patch(f"/part/{part_pk}/", update_payload)
            print(f"Successfully updated part {part_pk} with: {update_payload}")
        
        return {
            "status": "ok",
            "message": f"Part {part_pk} updated successfully",
            "partId": part_pk,
        }
    except Exception as e:
        print(f"Error updating part: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update part: {str(e)}")



class CreateStockItemRequest(BaseModel):
    """Request model for creating a stock item."""
    partId: int
    quantity: float
    locationId: int
    notes: str = ""
    barcode: str = "" # Add optional barcode field
    purchasePrice: Optional[float] = None
    purchasePriceCurrency: Optional[str] = None

@app.post("/create-stock-item")
async def create_stock_item_endpoint(data: CreateStockItemRequest) -> dict:
    """Create a new stock item in inventory."""
    try:
        stock_creation_response = create_stock_item(
            part_id=data.partId,
            location_id=data.locationId,
            quantity=data.quantity,
            notes=data.notes,
            barcode=data.barcode,
            purchase_price=data.purchasePrice,
            purchase_price_currency=data.purchasePriceCurrency,
        )

        if stock_creation_response.get("status") == "ok":
            raw_stock_item = stock_creation_response.get("stock_item")
            stock_item_pk = None
            if isinstance(raw_stock_item, list) and len(raw_stock_item) > 0:
                stock_item_pk = raw_stock_item[0].get("pk")
            elif isinstance(raw_stock_item, dict):
                stock_item_pk = raw_stock_item.get("pk")

            if data.barcode and stock_item_pk:
                try:
                    barcode_payload = {
                        "barcode": data.barcode,
                        "stockitem": stock_item_pk, # Link to stock_item PK
                    }
                    api.post("/barcode/link/", barcode_payload) # Use the specific link endpoint
                    print(f"Successfully added barcode {data.barcode} to stock item {stock_item_pk}")
                except Exception as barcode_error:
                    print(f"Warning: Failed to add barcode {data.barcode} to stock item {stock_item_pk}: {barcode_error}")
                    # Don't fail the entire stock creation if barcode fails
                    pass
            print(f"Successfully created stock item for part {data.partId} at location {data.locationId}: {data.quantity}")
            return {
                "status": "ok",
                "message": "Stock item created successfully",
                "stockItem": stock_creation_response.get("stock_item"),
            }
        else:
            raise HTTPException(status_code=500, detail=stock_creation_response.get("message"))
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error creating stock item: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create stock item: {e}")

@app.post("/get-item-from-qr")
def get_item_from_qr(data: BarcodeRequest) -> dict:
    """Get item info from a QR/barcode."""
    response = get_stock_from_qrid(data.qr_id)
    return response


@app.get("/get-item-name")
def get_item_name(item_id: int = Query(..., description="The ID of the item to get details for")) -> dict:
    """Get item details by ID."""
    response = get_item_details(item_id)
    return response


@app.get("/get-categories")
def get_categories() -> dict:
    """Fetch all part categories from InvenTree."""
    try:
        # Fetch all categories from InvenTree API
        categories = api.get("/part/category/")
        
        # Extract only id and name for each category
        category_list = [
            {"id": cat.get("pk"), "name": cat.get("name")}
            for cat in categories
        ]
        
        return {
            "status": "ok",
            "categories": category_list,
        }
    except Exception as e:
        print(f"Error fetching categories: {e}")
        return {
            "status": "error",
            "message": str(e),
        }


@app.get("/get-locations")
def get_locations() -> dict:
    """Fetch all storage locations from InvenTree."""
    try:
        # Fetch all locations from InvenTree API
        locations = api.get("/stock/location/")
        
        # Extract only id and name for each location
        location_list = [
            {"id": loc.get("pk"), "name": loc.get("name")}
            for loc in locations
        ]
        
        return {
            "status": "ok",
            "locations": location_list,
        }
    except Exception as e:
        print(f"Error fetching locations: {e}")
        return {
            "status": "error",
            "message": str(e),
        }


@app.post("/upload-part-image/{part_id}")
async def upload_part_image(part_id: int, file: UploadFile = File(...)) -> dict:
    """
    Upload an image to a part in InvenTree.
    
    Args:
        part_id: The ID of the part to upload the image to
        file: The image file to upload
        
    Returns:
        Response dictionary with status and details
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read file content
        image_data = await file.read()
        
        # Validate file size (max 10MB)
        if len(image_data) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image size must be less than 10MB")
        
        # Upload to InvenTree
        response = upload_image_to_part(
            part_id=part_id,
            image_data=image_data,
            filename=file.filename or "image.jpg",
            content_type=file.content_type or "image/jpeg"
        )
        
        if response.get("status") == "error":
            raise HTTPException(status_code=500, detail=response.get("message"))
        
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error uploading image to part {part_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {e}")


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
