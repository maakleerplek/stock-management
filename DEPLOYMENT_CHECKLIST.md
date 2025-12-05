# Pre-Deployment Checklist

## ✅ Before Deploying Any Changes

- [ ] **Backend Image Proxy** - Verify no changes to `/image-proxy` endpoint
  - [ ] Uses `api.session.get()` with `INVENTREE_PROXY_INTERNAL_URL`
  - [ ] Streams response with `chunk_size=8192`
  - [ ] Returns proper CORS headers
  - [ ] Includes error handling and logging

- [ ] **Environment Configuration** - Verify `.env` settings
  - [ ] `INVENTREE_PROXY_INTERNAL_URL=http://inventree-proxy` is present
  - [ ] `INVENTREE_URL=http://inventree-server:8000` is set
  - [ ] `INVENTREE_TOKEN` is valid (starts with `inv-`)
  - [ ] `INVENTREE_SITE_URL` matches your setup

- [ ] **Docker Configuration** - Verify `docker-compose.yml`
  - [ ] Caddy proxy service is defined and running
  - [ ] Backend service depends on inventree-server
  - [ ] All ports are correctly mapped
  - [ ] Volumes are correctly configured

- [ ] **All Containers Running** - Verify before testing
  ```bash
  docker compose ps
  # Should show: inventree-db, inventree-cache, inventree-server, 
  #              inventree-worker, inventree-proxy, inventree-backend-1, inventree-frontend-1
  ```

- [ ] **Backend Features** - Test all endpoints after changes
  ```bash
  # Test Shopping Mode
  curl -X POST http://localhost:8001/take-item \
    -H "Content-Type: application/json" \
    -d '{"itemId":1,"quantity":1}'
  
  # Test Volunteer Mode  
  curl -X POST http://localhost:8001/add-item \
    -H "Content-Type: application/json" \
    -d '{"itemId":1,"quantity":1}'
  
  # Test Image Proxy (with real image path)
  curl -I http://localhost:8001/image-proxy/media/part_images/your-real-image.webp
  ```

- [ ] **Frontend Testing** - Test image display
  - [ ] Open http://localhost:8081 in browser
  - [ ] Scan item with image using QR code
  - [ ] Image displays in shopping cart
  - [ ] Volunteer mode button works
  - [ ] Add to stock / Checkout buttons work
  - [ ] Browser DevTools console shows image loading logs

- [ ] **Logs Check** - Verify no errors
  ```bash
  # Check backend
  docker logs inventree-backend-1 --tail 50 | grep -i error
  
  # Check Caddy
  docker logs inventree-proxy --tail 50 | grep -i error
  
  # Check InvenTree
  docker logs inventree-server --tail 50 | grep -i error
  ```

## 🔒 Code Review Checklist

Before modifying `backend/main.py`, ensure:

- [ ] Image proxy endpoint uses `INVENTREE_PROXY_INTERNAL_URL` (not direct server URL)
- [ ] Image proxy uses `api.session.get()` (has auth headers)
- [ ] Image proxy streams response (never load entire image in memory)
- [ ] Image proxy includes CORS headers for frontend
- [ ] Add/Remove stock endpoints work with volunteer context
- [ ] QR lookup returns proper error handling
- [ ] All endpoints include try/except with appropriate logging

## 📋 Deployment Steps

1. Make code changes
2. Run pre-deployment checklist ✅
3. Rebuild containers:
   ```bash
   docker compose down
   docker compose up -d --build
   ```
4. Wait for containers to be healthy
5. Run backend tests (see above)
6. Test frontend with real items
7. Check logs for any errors
8. Commit and push changes

## 🚨 If Something Breaks

1. **Images not displaying?**
   - Check backend logs for image proxy errors
   - Verify Caddy is running: `docker ps | grep caddy`
   - Check INVENTREE_PROXY_INTERNAL_URL in .env

2. **Stock management not working?**
   - Check backend logs for API errors
   - Verify INVENTREE_URL and INVENTREE_TOKEN in .env
   - Check InvenTree server logs

3. **Need to rollback?**
   ```bash
   # Revert backend changes
   git checkout HEAD~1 backend/main.py
   
   # Rebuild
   docker compose down
   docker compose up -d --build
   ```

## 📞 Support Contact

Document any issues encountered:
- [ ] Date/Time of issue
- [ ] Which endpoint failed
- [ ] Error message from backend logs
- [ ] Steps to reproduce
- [ ] Frontend browser console errors
