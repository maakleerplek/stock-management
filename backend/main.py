"""
FastAPI backend for InvenTree stock management system.
Provides endpoints for item retrieval, stock removal, and image proxying.
"""

import logging
from io import BytesIO

from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import requests
import urllib3
import os
from dotenv import load_dotenv
from urllib.parse import urljoin
from typing import Optional, Dict, Any

from inventree_client import remove_stock, get_stock_from_qrid, get_item_details, api, add_stock, set_stock, create_part, create_stock_item, upload_image_to_part, create_category, create_location

# Suppress SSL warnings for internal Docker network communication
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Internal URL for image proxying - uses inventree-server directly
INVENTREE_SERVER_URL = os.getenv("INVENTREE_URL", "http://inventree-server:8000")

# Allowed CORS origins - restrict in production
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

app = FastAPI(title="InvenTree Stock Management API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Request Models ====================


class TakeItemRequest(BaseModel):
    """Request model for removing/adding items from/to stock."""
    itemId: int
    quantity: int = 1
    notes: str = "Removed via API"


class BarcodeRequest(BaseModel):
    """Request model for QR/barcode lookup."""
    qr_id: str


class CreatePartRequest(BaseModel):
    """Request model for creating a new part."""
    partName: str
    ipn: str = ""
    description: str = ""
    initialQuantity: float = 0
    minimumStock: Optional[float] = None
    icon: str = ""


class UpdatePartRequest(BaseModel):
    """Request model for updating an existing part."""
    category: str
    storageLocation: str
    barcode: str = ""


class CreateStockItemRequest(BaseModel):
    """Request model for creating a stock item."""
    partId: int
    quantity: float
    locationId: int
    notes: str = ""
    barcode: str = ""
    purchasePrice: Optional[float] = None
    purchasePriceCurrency: Optional[str] = None


class CreateCategoryRequest(BaseModel):
    """Request model for creating a category."""
    name: str
    description: str = ""
    parent: Optional[str] = None
    defaultLocation: Optional[str] = None
    defaultKeywords: str = ""
    structural: bool = False
    icon: str = ""


class CreateLocationRequest(BaseModel):
    """Request model for creating a location."""
    name: str
    description: str = ""
    parent: Optional[str] = None
    structural: bool = False
    external: bool = False
    locationType: Optional[str] = None
    icon: str = ""


# ==================== Endpoints ====================


@app.post("/take-item")
def take_item(data: TakeItemRequest) -> Dict[str, Any]:
    """
    Remove stock from inventory.
    
    Delegates to the InvenTree client to subtract the specified quantity
    from the given stock item.
    """
    response = remove_stock(data.itemId, data.quantity, data.notes)
    return response


@app.post("/add-item")
def add_item(data: TakeItemRequest) -> Dict[str, Any]:
    """
    Add stock to inventory.
    
    Delegates to the InvenTree client to add the specified quantity
    to the given stock item.
    """
    notes = data.notes.replace("Removed", "Added")
    response = add_stock(data.itemId, data.quantity, notes)
    return response


@app.post("/set-item")
def set_item(data: TakeItemRequest) -> Dict[str, Any]:
    """
    Set stock to an absolute quantity.
    
    Delegates to the InvenTree client to calculate the difference and
    adjust the stock to exactly match the target quantity.
    """
    notes = data.notes.replace("Removed", "Set").replace("Added", "Set")
    response = set_stock(data.itemId, data.quantity, notes)
    return response


@app.post("/create-part")
def create_part_endpoint(data: CreatePartRequest) -> Dict[str, Any]:
    """
    Create a new part in inventory.
    
    Will randomly generate an IPN if one is not provided.
    """
    try:
        part_ipn = data.ipn if data.ipn else f"{data.partName[:10]}-{os.urandom(3).hex()}".replace(" ", "-")

        part_creation_response = create_part(
            name=data.partName,
            ipn=part_ipn,
            description=data.description,
            minimum_stock=data.minimumStock,
            icon=data.icon,
        )

        if part_creation_response.get("status") == "error":
            raise HTTPException(status_code=500, detail=part_creation_response.get("message"))

        created_part = part_creation_response.get("part")
        part_pk = created_part.get("pk")

        return {
            "status": "ok",
            "message": "Part created successfully",
            "partId": part_pk,
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error("Error creating part: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to create part: {e}")


@app.post("/create-category")
def create_category_endpoint(data: CreateCategoryRequest) -> Dict[str, Any]:
    """
    Create a new part category.
    """
    try:
        # Safely parse integer fields which may be empty strings from frontend
        parent_id = int(data.parent) if data.parent and data.parent.isdigit() else None
        location_id = int(data.defaultLocation) if data.defaultLocation and data.defaultLocation.isdigit() else None

        response = create_category(
            name=data.name,
            description=data.description,
            parent=parent_id,
            default_location=location_id,
            default_keywords=data.defaultKeywords,
            structural=data.structural,
            icon=data.icon,
        )
        if response.get("status") == "error":
            raise HTTPException(status_code=500, detail=response.get("message"))
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error("Error in create_category_endpoint: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to create category: {e}")


@app.post("/create-location")
def create_location_endpoint(data: CreateLocationRequest) -> Dict[str, Any]:
    """
    Create a new storage location.
    """
    try:
        # Safely parse integer fields
        parent_id = int(data.parent) if data.parent and data.parent.isdigit() else None
        type_id = int(data.locationType) if data.locationType and data.locationType.isdigit() else None

        response = create_location(
            name=data.name,
            description=data.description,
            parent=parent_id,
            structural=data.structural,
            external=data.external,
            location_type=type_id,
            icon=data.icon,
        )
        if response.get("status") == "error":
            raise HTTPException(status_code=500, detail=response.get("message"))
        return response
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error("Error in create_location_endpoint: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to create location: {e}")


@app.patch("/update-part/{part_pk}")
def update_part_endpoint(part_pk: int, data: UpdatePartRequest) -> Dict[str, Any]:
    """
    Update an existing part in inventory.
    
    Allows changing the category or default storage location of a part.
    """
    try:
        category_id = int(data.category) if data.category else None
        location_id = int(data.storageLocation) if data.storageLocation else None

        update_payload = {}
        if category_id is not None:
            update_payload["category"] = category_id
        if location_id is not None:
            update_payload["default_location"] = location_id

        if update_payload:
            api.patch(f"/part/{part_pk}/", update_payload)
            logger.info("Successfully updated part %s with: %s", part_pk, update_payload)
        
        return {
            "status": "ok",
            "message": f"Part {part_pk} updated successfully",
            "partId": part_pk,
        }
    except Exception as e:
        logger.error("Error updating part: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to update part: {str(e)}")


@app.post("/create-stock-item")
def create_stock_item_endpoint(data: CreateStockItemRequest) -> Dict[str, Any]:
    """
    Create a new stock item in inventory.
    
    Creates physical stock for a specific part at a specific location.
    If a barcode is provided, it will automatically link it to the new stock item.
    """
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
                        "stockitem": stock_item_pk,
                    }
                    api.post("/barcode/link/", barcode_payload)
                    logger.info("Successfully added barcode %s to stock item %s", data.barcode, stock_item_pk)
                except Exception as barcode_error:
                    logger.warning("Failed to add barcode %s to stock item %s: %s", data.barcode, stock_item_pk, barcode_error)

            logger.info("Successfully created stock item for part %s at location %s: %s", data.partId, data.locationId, data.quantity)
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
        logger.error("Error creating stock item: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to create stock item: {e}")


@app.post("/get-item-from-qr")
def get_item_from_qr(data: BarcodeRequest) -> Dict[str, Any]:
    """
    Get item info from a QR/barcode.
    
    Takes the raw scanned string, resolves it to a stock item via InvenTree,
    and returns the fully populated item details.
    """
    response = get_stock_from_qrid(data.qr_id)
    return response


@app.get("/get-item-name")
def get_item_name(item_id: int = Query(..., description="The ID of the stock item to get details for")) -> Dict[str, Any]:
    """
    Get item details by stock ID.
    
    Returns a unified view of the stock item and its parent part.
    """
    response = get_item_details(item_id)
    return response


@app.get("/get-categories")
def get_categories() -> Dict[str, Any]:
    """
    Fetch all part categories from InvenTree.
    
    Returns a simplified list of category IDs and names for frontend dropdowns.
    """
    try:
        categories = api.get("/part/category/")
        category_list = [
            {"id": cat.get("pk"), "name": cat.get("name")}
            for cat in categories
        ]
        return {"status": "ok", "categories": category_list}
    except Exception as e:
        logger.error("Error fetching categories: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {e}")


@app.get("/get-locations")
def get_locations() -> Dict[str, Any]:
    """
    Fetch all storage locations from InvenTree.
    
    Returns a simplified list of location IDs and names for frontend dropdowns.
    """
    try:
        locations = api.get("/stock/location/")
        location_list = [
            {"id": loc.get("pk"), "name": loc.get("name")}
            for loc in locations
        ]
        return {"status": "ok", "locations": location_list}
    except Exception as e:
        logger.error("Error fetching locations: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to fetch locations: {e}")


@app.post("/upload-part-image/{part_id}")
def upload_part_image(part_id: int, file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload an image to a part in InvenTree.
    
    Validates that the file is an image and under 10MB before proxying
    the upload to the InvenTree API.
    """
    try:
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        image_data = file.file.read()
        
        if len(image_data) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Image size must be less than 10MB")
        
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
        logger.error("Error uploading image to part %s: %s", part_id, e)
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {e}")


@app.get("/image-proxy/{image_path:path}")
def image_proxy(image_path: str):
    """
    Proxy image requests to the InvenTree server with authentication.
    
    Routes: Frontend → Backend → InvenTree Proxy (Caddy)
    """
    try:
        caddy_url = "http://inventree-proxy:8081"
        full_url = urljoin(caddy_url + "/", image_path)

        logger.debug("Proxying image request to: %s", full_url)

        response = requests.get(full_url, stream=True, verify=False, timeout=10)
        response.raise_for_status()

        content_type = response.headers.get("Content-Type", "application/octet-stream")

        # Reject HTML responses (error pages, login redirects)
        if content_type.startswith("text/html"):
            raise HTTPException(
                status_code=404, 
                detail="Image not found or server returned HTML instead of image"
            )

        return StreamingResponse(
            response.iter_content(chunk_size=8192),
            media_type=content_type,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Content-Disposition": f"inline; filename={os.path.basename(image_path)}"
            }
        )
    except HTTPException:
        raise
    except requests.exceptions.RequestException as e:
        logger.error("Image proxy RequestException: %s", e)
        raise HTTPException(status_code=500, detail=f"Failed to fetch image: {e}")
    except Exception as e:
        logger.error("Image proxy error: %s", e)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
