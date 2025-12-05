"""
InvenTree API client for stock management operations.
Handles communication with InvenTree server with proper host header spoofing
to bypass SITE_URL validation from internal Docker containers.
"""

import os
from urllib.parse import urljoin

import requests
from dotenv import load_dotenv

load_dotenv()

# ==================== Environment Configuration ====================

INVENTREE_URL = os.getenv("INVENTREE_URL")
INVENTREE_TOKEN = os.getenv("INVENTREE_TOKEN")
INVENTREE_SITE_URL = os.getenv("INVENTREE_SITE_URL")

if not all([INVENTREE_URL, INVENTREE_TOKEN, INVENTREE_SITE_URL]):
    raise RuntimeError(
        "Missing required environment variables: "
        "INVENTREE_URL, INVENTREE_TOKEN, INVENTREE_SITE_URL"
    )

print(f"InvenTree Host: {INVENTREE_URL}")
print(f"InvenTree Token: {'*' * 10}{'*' * (len(INVENTREE_TOKEN) - 10) if INVENTREE_TOKEN else 'Not Set'}")


# ==================== InvenTree API Client ====================


class InvenTreeClient:
    """
    Custom HTTP client for InvenTree API with host header spoofing.
    
    This client adds the SITE_URL as the Host header in requests to bypass
    InvenTree's SITE_URL validation, allowing internal container access.
    """

    def __init__(self, base_url: str, token: str, site_url: str):
        """
        Initialize the InvenTree API client.
        
        Args:
            base_url: Base URL of InvenTree server (e.g., http://inventree-server:8000)
            token: Authentication token for InvenTree API
            site_url: SITE_URL configured in InvenTree (used as Host header)
        """
        self.base_url = f"{base_url}/api"
        self.token = token
        self.host_header = site_url.replace("http://", "").replace("https://", "")
        
        # Create session with auth headers
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Token {token}",
            "Host": self.host_header,
        })

    def get(self, endpoint: str) -> dict:
        """
        Perform a GET request to the InvenTree API.
        
        Args:
            endpoint: API endpoint (e.g., "/stock/123/")
            
        Returns:
            JSON response as dictionary
            
        Raises:
            Exception: If the API request fails
        """
        url = urljoin(self.base_url + "/", endpoint.lstrip("/"))
        
        try:
            response = self.session.get(url, params={"format": "json"})
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise Exception(f"GET {endpoint} failed: {e}") from e

    def post(self, endpoint: str, data: dict) -> dict:
        """
        Perform a POST request to the InvenTree API.
        
        Args:
            endpoint: API endpoint (e.g., "/barcode/")
            data: Request payload as dictionary
            
        Returns:
            JSON response as dictionary
            
        Raises:
            Exception: If the API request fails
        """
        url = urljoin(self.base_url + "/", endpoint.lstrip("/"))
        
        try:
            response = self.session.post(url, json=data, params={"format": "json"})
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            raise Exception(f"POST {endpoint} failed: {e}") from e


# Initialize global API client
api = InvenTreeClient(INVENTREE_URL, INVENTREE_TOKEN, INVENTREE_SITE_URL)


# ==================== Stock Management Functions ====================


def remove_stock(item_id: int, quantity: int, notes: str = "Removed via API") -> dict:
    """
    Remove items from stock in InvenTree.
    
    Args:
        item_id: The ID of the stock item to remove
        quantity: The quantity to remove
        notes: Optional removal notes
        
    Returns:
        Response dictionary with status and details
    """
    try:
        payload = {
            "items": [{"pk": item_id, "quantity": quantity}],
            "notes": notes,
        }
        api.post("/stock/remove/", payload)
        return {
            "status": "ok",
            "item_id": item_id,
            "quantity": quantity,
        }
    except Exception as e:
        print(f"Error removing stock: {e}")
        return {
            "status": "error",
            "item_id": item_id,
            "message": str(e),
        }


def add_stock(item_id: int, quantity: int, notes: str = "Added via API") -> dict:
    """
    Add items to stock in InvenTree.
    
    Args:
        item_id: The ID of the stock item to add
        quantity: The quantity to add
        notes: Optional addition notes
        
    Returns:
        Response dictionary with status and details
    """
    try:
        payload = {
            "items": [{"pk": item_id, "quantity": quantity}],
            "notes": notes,
        }
        api.post("/stock/add/", payload)
        return {
            "status": "ok",
            "item_id": item_id,
            "quantity": quantity,
        }
    except Exception as e:
        print(f"Error adding stock: {e}")
        return {
            "status": "error",
            "item_id": item_id,
            "message": str(e),
        }


def get_item_details(item_id: int) -> dict:
    """
    Fetch complete item details including part information.
    
    Args:
        item_id: The ID of the stock item
        
    Returns:
        Response dictionary with item details or error message
    """
    try:
        stock_item = api.get(f"/stock/{item_id}/")
        if not stock_item:
            return {
                "status": "error",
                "item_id": item_id,
                "message": "Stock item not found",
            }

        # Fetch linked part details
        part_id = stock_item.get("part")
        part_details = {}
        
        if part_id:
            try:
                part = api.get(f"/part/{part_id}/")
                
                image_path = part.get("image")
                full_image_url = None
                if image_path:
                    # Construct the full URL for the image
                    full_image_url = urljoin(INVENTREE_SITE_URL, image_path)

                part_details = {
                    "name": part.get("name"),
                    "description": part.get("description"),
                    "price": part.get("pricing_min"),
                    "image": image_path,
                }
            except Exception as e:
                print(f"Warning: Could not fetch part details for part {part_id}: {e}")

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
        print(f"Error fetching item details for {item_id}: {e}")
        return {
            "status": "error",
            "item_id": item_id,
            "message": "Failed to fetch item details",
        }


def get_stock_from_qrid(qr_id: str) -> dict:
    """
    Look up stock item by QR/barcode ID.
    
    Args:
        qr_id: The barcode/QR code string
        
    Returns:
        Response dictionary with item details or error message
    """
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
        print(f"Error looking up QR code {qr_id}: {e}")
        return {
            "status": "error",
            "qr_id": qr_id,
            "message": f"Barcode lookup failed: {str(e)}",
        }
