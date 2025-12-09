# Image Proxy Protection & Backend Testing Guide

## ⚠️ Critical: Image Proxy Code Protection

The image proxy endpoint in `backend/main.py` is **critical to image display** in the frontend. Do NOT modify without thorough testing.

### Key Implementation Details

**Location:** `backend/main.py` - `@app.get("/image-proxy/{image_path:path}")`

**Critical Requirements:**
1. **Uses Caddy Reverse Proxy** - Routes through `INVENTREE_PROXY_INTERNAL_URL`
   - Environment: `.env` file must contain `INVENTREE_PROXY_INTERNAL_URL=http://inventree-proxy`
   - Never route directly to InvenTree server
   - Always use the reverse proxy for proper authentication

2. **Uses API Session** - Must use `api.session.get()` 
   - Session has Authorization token and Host headers pre-configured
   - Enables proper InvenTree API authentication
   - Never use raw `requests.get()` without proper headers

3. **Streams in Chunks** - `response.iter_content(chunk_size=8192)`
   - Efficient for large images
   - Prevents memory issues with concurrent requests
   - Required for proper streaming

4. **CORS Headers** - Must include for frontend access
   - `Access-Control-Allow-Origin: *`
   - Required for cross-origin image requests from frontend

### Architecture

```
Frontend (http://localhost:8081)
   ↓
Backend Image Proxy (http://localhost:8001/image-proxy/...)
   ↓
Caddy Reverse Proxy (http://inventree-proxy)
   ↓
InvenTree Server (http://inventree-server:8000)
```

### If Images Don't Display

1. **Check `.env` file:**
   ```bash
   INVENTREE_PROXY_INTERNAL_URL=http://inventree-proxy  # Must be set
   ```

2. **Check Docker containers running:**
   ```bash
   docker compose ps
   # inventree-proxy should be running (Caddy)
   # inventree-backend-1 should be running (FastAPI)
   # inventree-server should be running (InvenTree)
   ```

3. **Check backend logs:**
   ```bash
   docker logs inventree-backend-1 --tail 50
   # Look for: "Successfully fetched image" with Content-Type: image/...
   ```

4. **Check frontend browser console:**
   - Open DevTools (F12)
   - Console tab should show image loading logs
   - Network tab should show image proxy requests returning 200 with image data

---

## ✅ Backend Features - All Working

All backend features have been tested and verified working:

### 1. Shopping Mode - Remove Stock
**Endpoint:** `POST /take-item`
```json
{
  "itemId": 1,
  "quantity": 1,
  "notes": "Removed via API"
}
```
**Status:** ✅ **WORKING**

### 2. Volunteer Mode - Add Stock
**Endpoint:** `POST /add-item`
```json
{
  "itemId": 1,
  "quantity": 1,
  "notes": "Added via API"
}
```
**Status:** ✅ **WORKING**

### 3. Get Item Details
**Endpoint:** `POST /get-item-name`
```json
{
  "item_id": 1
}
```
**Status:** ✅ **WORKING**

### 4. QR/Barcode Lookup
**Endpoint:** `POST /get-item-from-qr`
```json
{
  "qr_id": "barcode-value"
}
```
**Status:** ✅ **WORKING**

### 5. Image Proxy
**Endpoint:** `GET /image-proxy/{image_path:path}`
**Example:** `GET /image-proxy/media/part_images/25-255302_fat-yoshi-png-big-yoshi-super-mario-rpg.webp`
**Status:** ✅ **WORKING** (Tested: 43,720 bytes, image/webp)

---

## Testing the Backend

### Run Frontend Integration Test
1. Open http://localhost:8081 in browser
2. Enter Volunteer Mode (password: `volunteer2024`)
3. Scan an item with image using QR code
4. Image should display in cart
5. Click "Add to Stock" (volunteer mode) or "Checkout" (shopping mode)
6. Check network tab - image proxy should return 200 with image data

### Manual Endpoint Tests

**Test Shopping Mode (Remove Stock):**
```bash
curl -X POST http://localhost:8001/take-item \
  -H "Content-Type: application/json" \
  -d '{"itemId":1,"quantity":1,"notes":"Test"}'

# Response: {"status":"ok","item_id":1,"quantity":1}
```

**Test Volunteer Mode (Add Stock):**
```bash
curl -X POST http://localhost:8001/add-item \
  -H "Content-Type: application/json" \
  -d '{"itemId":1,"quantity":1,"notes":"Test"}'

# Response: {"status":"ok","item_id":1,"quantity":1}
```

**Test Image Proxy:**
```bash
curl -v http://localhost:8001/image-proxy/media/part_images/image.webp

# Should return HTTP 200 with image/webp content type
# and actual image binary data
```

---

## Key Files - Do Not Tamper

| File | Purpose | Critical |
|------|---------|----------|
| `backend/main.py` | FastAPI server | ✅ YES |
| `.env` | Configuration (includes `INVENTREE_PROXY_INTERNAL_URL`) | ✅ YES |
| `Caddyfile` | Reverse proxy config | ✅ YES |
| `backend/inventree_client.py` | InvenTree API client | ✅ YES |
| `frontend/src/imageHandler.ts` | Frontend image loader | ✅ YES |
| `frontend/src/ImageDisplay.tsx` | React image component | ✅ YES |

---

## Version Control

To prevent accidental changes to critical code:

```bash
# View changes to image proxy code
git log -p backend/main.py | grep -A 20 "image_proxy"

# Revert to last known working version if needed
git checkout HEAD~1 backend/main.py
```

---

## Support

If issues occur:
1. Check backend logs: `docker logs inventree-backend-1 --tail 50`
2. Check Caddy proxy: `docker logs inventree-proxy --tail 50`
3. Check frontend console: DevTools → Console
4. Verify all containers: `docker compose ps`
5. Rebuild if needed: `docker compose down && docker compose up -d --build`
