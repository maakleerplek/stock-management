# inventree_client.py

from inventree.api import InvenTreeAPI
import os
from dotenv import load_dotenv

load_dotenv()

api = InvenTreeAPI(
    host=os.getenv("INVENTREE_URL"),
    token=os.getenv("INVENTREE_TOKEN")
)


def remove_stock(item_id: int, quantity: int, notes: str = "Removed via API"):
    """Remove stock and return simplified response."""
    try:
        payload = {"items": [{"pk": item_id, "quantity": quantity}], "notes": notes}
        api.post("/stock/remove/", payload)
        return {"status": "ok", "item_id": item_id, "quantity": quantity}
    except Exception as e:
        return {"status": "error", "item_id": item_id, "message": str(e) or "Error removing stock"}


def get_item_details(item_id: int):
    """
    Fetches a stock item and returns only essential fields.
    """
    try:
        stock_item = api.get(f"/stock/{item_id}/")
        if not stock_item:
            return {"status": "error", "item_id": item_id, "message": "Stock item not found"}

        return {
            "status": "ok",
            "item": {
                "id": stock_item.get("pk"),
                "quantity": stock_item.get("quantity"),
                "serial": stock_item.get("serial"),
                "location": stock_item.get("location"),
                "status": stock_item.get("status_text")
            }
        }

    except Exception:
        return {"status": "error", "item_id": item_id, "message": "Error fetching stock item details"}






def get_stock_from_qrid(qr_id: str):
    try:
        barcode_resp = api.post("/barcode/", {"barcode": qr_id})
        stock_id = barcode_resp.get("stockitem", {}).get("pk")
        if not stock_id:
            return {"status": "error", "qr_id": qr_id, "message": "No stock item found"}

        return get_item_details(stock_id)

    except Exception:
        return {"status": "error", "qr_id": qr_id, "message": "Error occurred during API request"}
