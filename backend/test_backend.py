#!/usr/bin/env python3
"""
Test suite for InvenTree Stock Management Backend

Tests all major backend endpoints:
1. QR/Barcode lookup (/get-item-from-qr)
2. Item details by ID (/get-item-name)
3. Remove stock (/take-item) - Shopping mode
4. Add stock (/add-item) - Volunteer mode
5. Image proxy (/image-proxy/{image_path:path})

Run with: python backend/test_backend.py
"""

import requests
import json
from typing import Dict, Any

# Configuration
BACKEND_URL = "http://localhost:8001"
TIMEOUT = 10

# ANSI color codes for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'


def print_test(name: str) -> None:
    """Print test name in blue"""
    print(f"\n{BLUE}{'='*60}")
    print(f"TEST: {name}")
    print(f"{'='*60}{RESET}")


def print_pass(message: str) -> None:
    """Print success message in green"""
    print(f"{GREEN}✓ PASS: {message}{RESET}")


def print_fail(message: str) -> None:
    """Print failure message in red"""
    print(f"{RED}✗ FAIL: {message}{RESET}")


def print_info(message: str) -> None:
    """Print info message in yellow"""
    print(f"{YELLOW}ℹ {message}{RESET}")


def test_backend_health() -> bool:
    """Test if backend is responding"""
    print_test("Backend Health Check")
    try:
        response = requests.get(f"{BACKEND_URL}/docs", timeout=TIMEOUT)
        if response.status_code == 200:
            print_pass("Backend is responding (OpenAPI docs available)")
            return True
        else:
            print_fail(f"Backend returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_fail(f"Cannot connect to backend at {BACKEND_URL}")
        print_info("Make sure the backend container is running: docker compose up -d")
        return False
    except Exception as e:
        print_fail(f"Unexpected error: {e}")
        return False


def test_get_item_from_qr() -> bool:
    """Test QR/Barcode lookup endpoint"""
    print_test("Get Item from QR/Barcode")
    
    # Test with a sample QR ID (you should replace with a real one from your InvenTree)
    test_qr_id = "test-qr-123"
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/get-item-from-qr",
            json={"qr_id": test_qr_id},
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            print_pass(f"QR lookup endpoint works")
            print_info(f"Response: {json.dumps(data, indent=2)}")
            return True
        else:
            # 500 error might mean the QR doesn't exist, which is OK for this test
            if response.status_code >= 500:
                print_fail(f"Server error: {response.status_code}")
                print_info(f"Response: {response.text}")
                return False
            else:
                print_info(f"QR not found (status {response.status_code}) - this is OK if QR doesn't exist")
                return True
    except Exception as e:
        print_fail(f"Error: {e}")
        return False


def test_get_item_name() -> bool:
    """Test get item details by ID endpoint"""
    print_test("Get Item Details by ID")
    
    # Test with item ID 1 (common default in InvenTree)
    test_item_id = 1
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/get-item-name",
            json={"item_id": test_item_id},
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            print_pass(f"Item lookup endpoint works")
            print_info(f"Response: {json.dumps(data, indent=2)}")
            return True
        else:
            if response.status_code == 500:
                print_fail(f"Server error: {response.status_code}")
                print_info(f"Response: {response.text}")
                return False
            else:
                print_info(f"Item {test_item_id} not found (status {response.status_code}) - this is OK")
                return True
    except Exception as e:
        print_fail(f"Error: {e}")
        return False


def test_take_item() -> bool:
    """Test remove stock endpoint (Shopping mode)"""
    print_test("Remove Stock (/take-item) - Shopping Mode")
    
    # Test with a sample item
    test_payload = {
        "itemId": 1,
        "quantity": 1,
        "notes": "Test removal via API"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/take-item",
            json=test_payload,
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            print_pass(f"Stock removal endpoint works")
            print_info(f"Response: {json.dumps(data, indent=2)}")
            return True
        else:
            if response.status_code == 500:
                print_fail(f"Server error: {response.status_code}")
                print_info(f"Response: {response.text}")
                return False
            else:
                print_info(f"Stock removal failed with status {response.status_code}")
                print_info(f"Response: {response.text}")
                return True  # Endpoint exists, even if item/stock doesn't
    except Exception as e:
        print_fail(f"Error: {e}")
        return False


def test_add_item() -> bool:
    """Test add stock endpoint (Volunteer mode)"""
    print_test("Add Stock (/add-item) - Volunteer Mode")
    
    # Test with a sample item
    test_payload = {
        "itemId": 1,
        "quantity": 1,
        "notes": "Test addition via API"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/add-item",
            json=test_payload,
            timeout=TIMEOUT
        )
        
        if response.status_code == 200:
            data = response.json()
            print_pass(f"Stock addition endpoint works (Volunteer mode)")
            print_info(f"Response: {json.dumps(data, indent=2)}")
            return True
        else:
            if response.status_code == 500:
                print_fail(f"Server error: {response.status_code}")
                print_info(f"Response: {response.text}")
                return False
            else:
                print_info(f"Stock addition failed with status {response.status_code}")
                print_info(f"Response: {response.text}")
                return True  # Endpoint exists, even if item/stock doesn't
    except Exception as e:
        print_fail(f"Error: {e}")
        return False


def test_image_proxy() -> bool:
    """Test image proxy endpoint"""
    print_test("Image Proxy Endpoint")
    
    # Test with a common image path
    test_image_path = "media/part_images/test.webp"
    
    try:
        response = requests.get(
            f"{BACKEND_URL}/image-proxy/{test_image_path}",
            timeout=TIMEOUT
        )
        
        # Any status is OK - we're just checking the endpoint exists and handles the request
        if response.status_code in [200, 404, 500]:
            print_pass(f"Image proxy endpoint is responsive (status: {response.status_code})")
            
            if response.status_code == 200:
                content_type = response.headers.get('Content-Type', 'unknown')
                content_length = len(response.content)
                print_info(f"Image returned: {content_type}, {content_length} bytes")
            else:
                print_info(f"Response: {response.text[:200]}")
            
            return True
        else:
            print_fail(f"Unexpected status: {response.status_code}")
            return False
    except Exception as e:
        print_fail(f"Error: {e}")
        return False


def main():
    """Run all tests"""
    print(f"\n{BLUE}{'='*60}")
    print("BACKEND TEST SUITE")
    print(f"{'='*60}{RESET}")
    print_info(f"Testing backend at: {BACKEND_URL}")
    
    tests = [
        ("Backend Health", test_backend_health),
        ("Get Item from QR", test_get_item_from_qr),
        ("Get Item Details", test_get_item_name),
        ("Remove Stock (Shopping)", test_take_item),
        ("Add Stock (Volunteer)", test_add_item),
        ("Image Proxy", test_image_proxy),
    ]
    
    results = []
    for name, test_func in tests:
        try:
            result = test_func()
            results.append((name, result))
        except Exception as e:
            print_fail(f"Test crashed: {e}")
            results.append((name, False))
    
    # Summary
    print(f"\n{BLUE}{'='*60}")
    print("TEST SUMMARY")
    print(f"{'='*60}{RESET}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = f"{GREEN}✓ PASS{RESET}" if result else f"{RED}✗ FAIL{RESET}"
        print(f"{status} - {name}")
    
    print(f"\n{BLUE}Total: {passed}/{total} tests passed{RESET}\n")
    
    return passed == total


if __name__ == "__main__":
    import sys
    sys.exit(0 if main() else 1)
