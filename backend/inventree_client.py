# inventree_client.py

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from urllib.parse import urljoin

load_dotenv()

# Create the FastAPI app instance
app = FastAPI()

# Add CORS middleware to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# try to get env variables
try:
    host = os.getenv("INVENTREE_URL")
    token = os.getenv("INVENTREE_TOKEN")
    site_url = os.getenv("INVENTREE_SITE_URL")
except Exception as e:  
    print(f"Error: {e}")
    exit(1)
print("InvenTree Host:", host)
print("InvenTree Token:", token if token else "Not Set")

# Create custom API client using raw requests with Host header spoofing
class InvenTreeClient:
    def __init__(self, host, token, site_url):
        self.base_url = host + "/api"
        self.token = token
        self.host_header = site_url.replace("http://", "").replace("https://", "")
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Token {token}",
            "Host": self.host_header
        })
    
    def get(self, endpoint):
        url = urljoin(self.base_url + "/", endpoint.lstrip("/"))
        try:
            response = self.session.get(url, params={"format": "json"})
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"API error: {response.status_code} - {response.text}")
        except Exception as e:
            raise Exception(f"Failed to GET {endpoint}: {e}")
    
    def post(self, endpoint, data):
        url = urljoin(self.base_url + "/", endpoint.lstrip("/"))
        try:
            response = self.session.post(url, json=data, params={"format": "json"})
            if response.status_code in [200, 201]:
                return response.json()
            else:
                raise Exception(f"API error: {response.status_code} - {response.text}")
        except Exception as e:
            raise Exception(f"Failed to POST {endpoint}: {e}")

try: 
    api = InvenTreeClient(host, token, site_url)
except Exception as e:  
    print(f"Error: {e}")
    exit(1)

@app.post("/remove-stock")
def remove_stock(item_id: int, quantity: int, notes: str = "Removed via API"):
    """Remove stock and return simplified response."""
    try:
        payload = {"items": [{"pk": item_id, "quantity": quantity}], "notes": notes}
        api.post("/stock/remove/", payload)
        return {"status": "ok", "item_id": item_id, "quantity": quantity}
    except Exception as e: 
        print(f"Error in remove_stock: {e}")
        return {"status": "error", "item_id": item_id, "message": str(e) or "An unknown error occurred while removing stock"}

@app.get("/item-details/{item_id}")
def get_item_details(item_id: int):
    """
    Fetches a stock item and returns only essential fields,
    including linked part name, description, and image.
    """
    try:
        stock_item = api.get(f"/stock/{item_id}/")
        if not stock_item:
            return {"status": "error", "item_id": item_id, "message": "Stock item not found"}

        # Fetch linked part details (name, description, image)
        part_id = stock_item.get("part")
        # print("stock_item:")
        # print(stock_item)
        part_details = {}
        if part_id:
            try:
                part = api.get(f"/part/{part_id}/")
                # print("part:")
                # print(part)
                part_details = {
                    "name": part.get("name"),
                    "description": part.get("description"),
                    "price": part.get("pricing_min"),
                    "thumbnail": part.get("thumbnail")
                }

            except Exception:
                print("Error fetching part details")
                pass

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
                "thumbnail": part_details.get("thumbnail"),
            }
        }

    except Exception as e:
        print(f"Error in get_item_details for item_id {item_id}: {e}")
        return {"status": "error", "item_id": item_id, "message": "An error occurred while fetching stock item details"}

@app.get("/get-item-from-qr/{qr_id}")
def get_stock_from_qrid(qr_id: str):
    try:
        barcode_resp = api.post("/barcode/", {"barcode": qr_id})
        stock_id = barcode_resp.get("stockitem", {}).get("pk")
        if not stock_id:
            return {"status": "error", "qr_id": qr_id, "message": "No stock item found"}

        return get_item_details(stock_id)  

    except Exception as e:
        error_message = f"An error occurred during the API request: {e}"
        if hasattr(e, 'response') and e.response is not None:
            response = e.response  # Access the response object from the exception
            if response is not None:
                status_code = response.status_code
                try:
                    error_detail = response.json()
                    error_message = f"API request failed with status code {status_code}: {error_detail}"
                except:
                    error_message = f"API request failed with status code {status_code} and could not parse error detail."
        else:
            error_message = f"API request failed: No response received. {e}"
        print(f"Error in get_stock_from_qrid for qr_id '{qr_id}': {error_message}")
        return {"status": "error", "qr_id": qr_id, "message": error_message}
