# Image Display Implementation - Quick Start Guide

## What's New

Your stock management system now has a **robust image display system** that handles network issues gracefully!

### Problems Solved ✓
- ✓ Network timeouts no longer cause blank images
- ✓ Automatic retry logic (3 attempts with exponential backoff)
- ✓ Client-side image caching (24-hour duration)
- ✓ Informative error messages and fallback UI
- ✓ CORS support for cross-origin image requests

## Key Features

### 1. **Automatic Retry Logic**
Images that fail to load are automatically retried up to 3 times with increasing delays (1s, 2s, 3s).

### 2. **Smart Caching**
Successfully loaded images are cached in browser localStorage for 24 hours. Subsequent loads are instant.

### 3. **User Feedback**
- **Loading**: Shows skeleton placeholder while fetching
- **Success**: Displays image with proper styling
- **Error**: Shows friendly error message instead of broken image

### 4. **Responsive Images**
Images automatically adapt to different sizes (default 200x200px, configurable).

## What Changed

### Frontend Files Created/Modified:

1. **`imageHandler.ts`** (NEW)
   - Core image loading logic with retry and caching
   - Functions: `loadImage()`, `getImageUrl()`, `preloadImages()`, `clearImageCache()`

2. **`ImageDisplay.tsx`** (NEW)
   - React component for displaying images
   - Handles loading, error, and success states
   - Ready to use anywhere in your app

3. **`shoppingcart.tsx`** (MODIFIED)
   - Now imports and uses `ImageDisplay` component
   - Shows 100x100px image for each item in cart

### Backend Files Modified:

1. **`main.py`** (MODIFIED)
   - Enhanced `/image-proxy/{image_path}` endpoint
   - Added retry logic function `_get_with_retries()`
   - Better error handling with specific HTTP status codes

## How to Use

### Displaying Images in Your Components

```typescript
import ImageDisplay from './ImageDisplay';

export default function MyComponent() {
    return (
        <ImageDisplay
            imagePath="media/part_images/part_123.png"
            alt="Product image"
            width={200}
            height={200}
        />
    );
}
```

### Preloading Images

```typescript
import { preloadImages } from './imageHandler';

// Load multiple images upfront for better performance
useEffect(() => {
    preloadImages([
        'media/part_images/part_1.png',
        'media/part_images/part_2.png'
    ]);
}, []);
```

### Clearing Image Cache

```typescript
import { clearImageCache } from './imageHandler';

// Clear cache if needed
clearImageCache();
```

## Configuration

### Change Retry Attempts
In `imageHandler.ts`, modify `IMAGE_RETRY_ATTEMPTS`:
```typescript
const IMAGE_RETRY_ATTEMPTS = 3; // Change to desired number
```

### Change Cache Duration
In `imageHandler.ts`, modify `IMAGE_CACHE_DURATION`:
```typescript
const IMAGE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
```

### Change Image Timeout
In `imageHandler.ts`, modify `IMAGE_LOAD_TIMEOUT`:
```typescript
const IMAGE_LOAD_TIMEOUT = 15000; // 15 seconds
```

### Change Backend Retry Logic
In `backend/main.py`, modify `_get_with_retries()` parameters:
```python
response = _get_with_retries(full_url, headers, max_retries=3, timeout=10)
```

## Testing

### Test Successful Image Load
1. Scan an item with an image in InvenTree
2. Image should appear in the shopping cart
3. Check browser DevTools (Application tab) to see cached images

### Test Error Handling
1. In browser DevTools, go to Network tab
2. Set Network Throttling to "Offline" or "Slow 3G"
3. Scan an item
4. Should show error message after retries

### Test Cache
1. Load an item with image
2. Clear browser network cache (DevTools → Network → disable cache)
3. Load same item again
4. Image loads instantly from localStorage cache

### View Cache Content
In browser console:
```javascript
// See all cached images
Object.keys(localStorage).filter(k => k.startsWith('img_cache_'))

// Clear specific image
localStorage.removeItem('img_cache_<base64_key>')

// Clear all images
localStorage.clear()
```

## Architecture Overview

```
Frontend (React)
    ├── ImageDisplay.tsx (Component)
    │   └── Uses imageHandler functions
    └── imageHandler.ts (Logic)
        ├── Retry logic
        ├── Caching
        └── Error handling
            ↓
Backend (FastAPI)
    └── /image-proxy endpoint
        ├── Validates path
        ├── Adds auth headers
        ├── Retries failed requests
        └── Streams response
            ↓
InvenTree Server
    └── Returns image file
```

## Error Responses

The system handles these scenarios:

| Scenario | Frontend | Backend |
|----------|----------|---------|
| Network timeout | Retries 3x, then shows error | 504 Gateway Timeout |
| Connection refused | Retries 3x, then shows error | 502 Bad Gateway |
| Invalid path | Shows error immediately | 400 Bad Request |
| Missing image | Shows error after retries | 502 Bad Gateway |
| Server error | Retries 3x, then shows error | 500 Internal Error |

## Performance Tips

1. **Preload images on app startup** if you have known items
2. **Use appropriate sizes** - don't request 2000x2000px for 100x100px display
3. **Monitor cache size** - clear old cache if localStorage fills up
4. **Test with slow networks** to verify retry logic works

## Debugging

### Enable Debug Logging
In `imageHandler.ts`, images are logged to console:
```javascript
console.error(`Failed to load image: ${imageRelativePath}`, error)
```

### Check Backend Logs
```bash
docker logs inventree_backend
# Look for "DEBUG: Proxying image request to:" messages
# And "ERROR:" messages for failures
```

### Browser Console
Open DevTools and check:
1. Network tab - see image requests and responses
2. Application tab - see localStorage cache
3. Console - see any JS errors

## Common Issues & Solutions

### Images appear as broken icon

**Cause**: Image file doesn't exist in InvenTree

**Solution**: 
1. Log into InvenTree web interface
2. Go to the part details
3. Check that an image is uploaded
4. Save the image again if needed

### "Network error" message appears

**Cause**: Backend cannot connect to InvenTree

**Solution**:
1. Check that InvenTree container is running: `docker ps`
2. Verify INVENTREE_URL is correct in `.env`
3. Check InvenTree logs: `docker logs inventree`
4. Test connectivity: `docker exec inventree_backend curl http://inventree:8000/api/`

### Images load slowly

**Cause**: Network latency or large file sizes

**Solution**:
1. Check if InvenTree server is under load
2. Consider reducing image size in InvenTree
3. Verify backend and InvenTree are on same network
4. Check browser network tab for actual load times

### Cache not clearing

**Cause**: localStorage not being cleared properly

**Solution**: In browser console:
```javascript
localStorage.clear()
location.reload()
```

## Next Steps

1. **Test the system**: Scan items and verify images display
2. **Monitor performance**: Check browser DevTools for load times
3. **Gather feedback**: Note any issues with specific items
4. **Customize styles**: Adjust image sizes and styling as needed
5. **Deploy**: Push changes to production

## Support Resources

- **InvenTree API Docs**: https://docs.inventree.org/en/stable/api/
- **InvenTree Image Storage**: Check InvenTree documentation for image location and setup
- **React Documentation**: https://react.dev/
- **MUI Component Library**: https://mui.com/material-ui/

## Summary

Your images now:
- ✓ Load automatically with 3 retries
- ✓ Cache for 24 hours
- ✓ Show helpful error messages
- ✓ Display in shopping cart
- ✓ Handle network failures gracefully

Enjoy reliable image loading! 🎉
