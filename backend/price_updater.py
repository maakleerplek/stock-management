import logging
import re
import requests

logger = logging.getLogger(__name__)

WIKI_URL = "https://wiki.maakleerplek.be/en/hightechlab"

def fetch_wiki_prices():
    """
    Universal Scraper: Automatically finds ANY service/price pair on the wiki.
    Looks for the pattern: <td>Service Name</td><td>€Price/Unit</td>
    """
    # Hardcoded fallbacks in case the wiki is down or structure changes drastically
    fallbacks = [
        {"id": "laser", "name": "Laser Cutter", "price": 0.50, "unit": "min"},
        {"id": "fdm", "name": "FDM 3D Printer", "price": 0.10, "unit": "g"},
        {"id": "resin", "name": "Resin 3D Printer", "price": 2.00, "unit": "hr"},
        {"id": "cnc", "name": "CNC Mill", "price": 3.00, "unit": "hr"},
        {"id": "vacuum", "name": "Vacuum Former", "price": 1.00, "unit": "hr"}
    ]

    try:
        logger.info(f"Universal Fetch: Accessing {WIKI_URL}")
        response = requests.get(WIKI_URL, timeout=10)
        response.raise_for_status()
        html_content = response.text

        # Universal Regex Pattern:
        # Matches <td>Service Name</td> followed by <td>€0.50/unit</td>
        # It allows for optional whitespace and different currency symbols
        pattern = r"<td>([^<]+)</td>\s*<td>€?\s*(\d+[.,]\d+)/([^<]+)</td>"
        
        matches = re.finditer(pattern, html_content, re.IGNORECASE | re.DOTALL)
        
        extracted_services = []
        seen_names = set()

        for match in matches:
            name = match.group(1).strip()
            # Skip header-like text or empty names
            if not name or len(name) > 50 or "equipment" in name.lower() or "price" in name.lower():
                continue
                
            price_str = match.group(2).replace(',', '.')
            unit = match.group(3).strip()
            
            # Create a clean ID
            internal_id = re.sub(r'[^a-z0-9]', '_', name.lower()).strip('_')
            
            if internal_id not in seen_names:
                extracted_services.append({
                    "id": internal_id,
                    "name": name,
                    "price": float(price_str),
                    "unit": unit
                })
                seen_names.add(internal_id)
        
        if extracted_services:
            logger.info(f"Successfully auto-discovered {len(extracted_services)} services from wiki.")
            return extracted_services
        
        logger.warning("Universal scraper found 0 matches. Returning fallbacks.")
        return fallbacks

    except Exception as e:
        logger.error(f"Universal scraper failed: {e}")
        return fallbacks
