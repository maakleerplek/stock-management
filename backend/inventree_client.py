"""
InvenTree API client for stock management operations.
Handles communication with InvenTree server with proper host header spoofing
to bypass SITE_URL validation from internal Docker containers.
"""

import logging
import os
from urllib.parse import urljoin
from typing import Optional

import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# ==================== Environment Configuration ====================

INVENTREE_URL = os.getenv("INVENTREE_URL", "http://inventree-server:8000")
INVENTREE_TOKEN = os.getenv("INVENTREE_TOKEN")
# SITE_DOMAIN is used for Host header spoofing to bypass InvenTree's SITE_URL validation
SITE_DOMAIN = os.getenv("SITE_DOMAIN", "localhost")

if not INVENTREE_TOKEN:
    raise RuntimeError("Missing required environment variable: INVENTREE_TOKEN")

logger.info("InvenTree URL: %s", INVENTREE_URL)
logger.info("Site Domain: %s", SITE_DOMAIN)
logger.info("InvenTree Token: %s...", '*' * 10)


# ==================== InvenTree API Client ====================


class InvenTreeClient:
    """
    Custom HTTP client for InvenTree API with host header spoofing.
    
    Adds the SITE_DOMAIN as the Host header in requests to bypass
    InvenTree's SITE_URL validation, allowing internal container access.
    """

    def __init__(self, base_url: str, token: str, site_domain: str):
        self.base_url = f"{base_url}/api"
        self.token = token
        self.host_header = site_domain
        
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Token {token}",
            "Host": self.host_header,
        })

    def get(self, endpoint: str) -> dict:
        """Perform a GET request to the InvenTree API."""
        url = urljoin(self.base_url + "/", endpoint.lstrip("/"))
        try:
            response = self.session.get(url, params={"format": "json"})
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise Exception(f"GET {endpoint} failed: {e}") from e

    def post(self, endpoint: str, data: dict) -> dict:
        """Perform a POST request to the InvenTree API."""
        url = urljoin(self.base_url + "/", endpoint.lstrip("/"))
        try:
            response = self.session.post(url, json=data, params={"format": "json"})
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise Exception(f"POST {endpoint} failed: {e}") from e

    def patch(self, endpoint: str, data: dict) -> dict:
        """Perform a PATCH request to the InvenTree API."""
        url = urljoin(self.base_url + "/", endpoint.lstrip("/"))
        try:
            response = self.session.patch(url, json=data, params={"format": "json"})
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise Exception(f"PATCH {endpoint} failed: {e}") from e

    def upload_file(self, endpoint: str, file_data: bytes, filename: str, content_type: str = "image/jpeg") -> dict:
        """Upload a file to the InvenTree API using multipart/form-data."""
        url = urljoin(self.base_url + "/", endpoint.lstrip("/"))
        try:
            files = {"image": (filename, file_data, content_type)}
            response = self.session.patch(url, files=files, params={"format": "json"})
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise Exception(f"File upload to {endpoint} failed: {e}") from e


# Initialize global API client
api = InvenTreeClient(INVENTREE_URL, INVENTREE_TOKEN, SITE_DOMAIN)


# ==================== Stock Management Functions ====================


def _modify_stock(endpoint: str, item_id: int, quantity: int, notes: str, action_verb: str) -> dict:
    """
    Shared helper for add/remove stock operations.
    
    Args:
        endpoint: API endpoint (e.g., "/stock/add/" or "/stock/remove/")
        item_id: The ID of the stock item
        quantity: The quantity to add/remove
        notes: Operation notes
        action_verb: For logging (e.g., "adding", "removing")
    """
    try:
        payload = {
            "items": [{"pk": item_id, "quantity": quantity}],
            "notes": notes,
        }
        api.post(endpoint, payload)
        return {
            "status": "ok",
            "item_id": item_id,
            "quantity": quantity,
        }
    except Exception as e:
        logger.error("Error %s stock: %s", action_verb, e)
        return {
            "status": "error",
            "item_id": item_id,
            "message": str(e),
        }


def remove_stock(item_id: int, quantity: int, notes: str = "Removed via API") -> dict:
    """Remove items from stock in InvenTree."""
    return _modify_stock("/stock/remove/", item_id, quantity, notes, "removing")


def add_stock(item_id: int, quantity: int, notes: str = "Added via API") -> dict:
    """Add items to stock in InvenTree."""
    return _modify_stock("/stock/add/", item_id, quantity, notes, "adding")


def set_stock(item_id: int, quantity: int, notes: str = "Stock set via API") -> dict:
    """Set stock to an absolute quantity in InvenTree."""
    try:
        stock_item = api.get(f"/stock/{item_id}/")
        current_quantity = stock_item.get("quantity", 0)
        difference = quantity - current_quantity
        
        if difference == 0:
            return {
                "status": "ok",
                "item_id": item_id,
                "quantity": quantity,
                "message": "Stock quantity already at target value",
            }
        elif difference > 0:
            _modify_stock("/stock/add/", item_id, difference, notes, "adding (set)")
        else:
            _modify_stock("/stock/remove/", item_id, abs(difference), notes, "removing (set)")
        
        return {
            "status": "ok",
            "item_id": item_id,
            "quantity": quantity,
            "previous_quantity": current_quantity,
        }
    except Exception as e:
        logger.error("Error setting stock: %s", e)
        return {
            "status": "error",
            "item_id": item_id,
            "message": str(e),
        }


def create_part(
    name: str,
    ipn: str,
    description: str = "",
    category: int = None,
    units: str = "",
    default_location: int = None,
    default_supplier: int = None,
    notes: str = "",
    active: bool = True,
    purchaseable: bool = True,
    minimum_stock: Optional[float] = None,
) -> dict:
    """Create a new part in InvenTree."""
    try:
        payload = {
            "name": name,
            "IPN": ipn,
            "description": description,
            "units": units,
            "notes": notes,
            "active": active,
            "purchaseable": purchaseable,
        }

        if category is not None:
            payload["category"] = category
        if default_location is not None:
            payload["default_location"] = default_location
        if default_supplier is not None:
            payload["default_supplier"] = default_supplier
        if minimum_stock is not None:
            payload["minimum_stock"] = minimum_stock

        response = api.post("/part/", payload)
        return {"status": "ok", "part": response}
    except Exception as e:
        logger.error("Error creating part: %s", e)
        return {"status": "error", "message": str(e)}


def create_stock_item(
    part_id: int,
    location_id: int,
    quantity: float,
    notes: str = "",
    barcode: str = "",
    purchase_price: Optional[float] = None,
    purchase_price_currency: Optional[str] = None
) -> dict:
    """Create a new stock item in InvenTree for a given part."""
    try:
        payload = {
            "part": part_id,
            "location": location_id,
            "quantity": quantity,
            "notes": notes,
        }
        if barcode:
            payload["barcode"] = barcode
        if purchase_price is not None:
            payload["purchase_price"] = purchase_price
        if purchase_price_currency is not None:
            payload["purchase_price_currency"] = purchase_price_currency
        response = api.post("/stock/", payload)
        return {"status": "ok", "stock_item": response}
    except Exception as e:
        logger.error("Error creating stock item: %s", e)
        return {"status": "error", "message": str(e)}


def get_item_details(item_id: int) -> dict:
    """Fetch complete item details including part information."""
    try:
        stock_item = api.get(f"/stock/{item_id}/")
        if not stock_item:
            return {
                "status": "error",
                "item_id": item_id,
                "message": "Stock item not found",
            }

        part_id = stock_item.get("part")
        part_details = {}
        
        if part_id:
            try:
                part = api.get(f"/part/{part_id}/")
                part_details = {
                    "name": part.get("name"),
                    "description": part.get("description"),
                    "price": part.get("pricing_min"),
                    "image": part.get("image"),
                }
            except Exception as e:
                logger.warning("Could not fetch part details for part %s: %s", part_id, e)

        return {
            "status": "ok",
            "item": {
                "id": stock_item.get("pk"),
                "quantity": stock_item.get("quantity"),
                "serial": stock_item.get("serial"),
                "location": stock_item.get("location"),
                "status": stock_item.get("status_text"),
                "name": part_details.get("name"),
                "description": part_details.get("description"),
                "price": part_details.get("price"),
                "image": part_details.get("image"),
            },
        }
    except Exception as e:
        logger.error("Error fetching item details for %s: %s", item_id, e)
        return {
            "status": "error",
            "item_id": item_id,
            "message": "Failed to fetch item details",
        }


def upload_image_to_part(part_id: int, image_data: bytes, filename: str, content_type: str = "image/jpeg") -> dict:
    """Upload an image to a part in InvenTree."""
    try:
        response = api.upload_file(f"/part/{part_id}/", image_data, filename, content_type)
        return {
            "status": "ok",
            "part_id": part_id,
            "message": "Image uploaded successfully",
            "response": response,
        }
    except Exception as e:
        logger.error("Error uploading image to part %s: %s", part_id, e)
        return {
            "status": "error",
            "part_id": part_id,
            "message": str(e),
        }


def get_stock_from_qrid(qr_id: str) -> dict:
    """Look up stock item by QR/barcode ID."""
    try:
        barcode_response = api.post("/barcode/", {"barcode": qr_id})
        stock_id = barcode_response.get("stockitem", {}).get("pk")
        
        if not stock_id:
            return {
                "status": "error",
                "qr_id": qr_id,
                "message": "No stock item found for this barcode",
            }

        return get_item_details(stock_id)
    except Exception as e:
        logger.error("Error looking up QR code %s: %s", qr_id, e)
        return {
            "status": "error",
            "qr_id": qr_id,
            "message": f"Barcode lookup failed: {str(e)}",
        }
