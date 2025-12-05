# Image Display System Documentation

## Overview

This document describes the robust image display system implemented to handle network failures and display issues in the stock management frontend.

## Problem Solved

Previously, images would fail to display due to:
- Network timeouts when reaching InvenTree
- CORS (Cross-Origin Resource Sharing) issues
- Transient network failures without retry logic
- No caching mechanism for images
- No user feedback when images failed to load

## Solution Components

### 1. Backend Image Proxy (`backend/main.py`)

The backend now includes an enhanced image proxy endpoint at `/image-proxy/{image_path:path}`.

#### Features:
- **Retry Logic**: Implements exponential backoff retry strategy (3 attempts by default)
- **Timeout Handling**: Graceful handling of connection timeouts
- **Error Codes**:
  - `400`: Invalid image path
  - `502`: Cannot connect to InvenTree server
  - `504`: InvenTree server timeout
  - `500`: Unexpected error
- **Streaming**: Efficiently streams large images in chunks
- **Caching Headers**: Sets appropriate `Cache-Control` headers
- **CORS Support**: Allows cross-origin requests

#### Example Flow:
```
Frontend Request
    ↓
/image-proxy/media/part_images/abc.png
    ↓
Backend validates path and adds authentication
    ↓
Fetches from InvenTree with retries
    ↓
Returns streamed image response
```

### 2. Frontend Image Handler (`frontend/src/imageHandler.ts`)

Provides utility functions for robust image loading with caching and retry logic.

#### Main Functions:

**`loadImage(imageRelativePath)`**
- Loads image from the backend proxy
- Implements client-side retry logic (3 attempts)
- Caches successful images in localStorage
- Returns `ImageLoadResult` with success/error information

```typescript
const result = await loadImage('media/part_images/part_123.png');
if (result.success) {
    imgElement.src = result.url;
} else {
    console.error('Image failed:', result.error);
}
```

**`getImageUrl(imageRelativePath)`**
- Simple wrapper that returns URL string or empty string
- Useful for direct image src binding

```typescript
const url = await getImageUrl('media/part_images/part_123.png');
```

**`preloadImages(imagePaths)`**
- Preload multiple images to improve perceived performance
- Uses `Promise.allSettled()` to continue even if some fail

```typescript
await preloadImages([
    'media/part_images/part_1.png',
    'media/part_images/part_2.png'
]);
```

**`clearImageCache()`**
- Clear all cached images from localStorage
- Useful for cache invalidation

#### Cache Details:
- **Storage**: Browser localStorage
- **Duration**: 24 hours
- **Key Format**: Base64-encoded image path
- **Prefix**: `img_cache_`

### 3. Image Display Component (`frontend/src/ImageDisplay.tsx`)

Reusable React component for displaying images with full error handling.

#### Features:
- **Loading State**: Shows skeleton loader while fetching
- **Error State**: Displays informative error message with icon
- **Success State**: Shows image with proper styling
- **Callbacks**: `onLoad` and `onError` callbacks for tracking
- **Accessibility**: Proper alt text support
- **Responsive**: Configurable width/height

#### Usage:

```typescript
import ImageDisplay from './ImageDisplay';

export default function MyComponent() {
    return (
        <ImageDisplay
            imagePath="media/part_images/part_123.png"
            alt="Product image"
            width={200}
            height={200}
            onLoad={() => console.log('Image loaded')}
            onError={(error) => console.error('Image error:', error)}
        />
    );
}
```

#### Props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `imagePath` | `string \| null` | - | Relative path to image |
| `alt` | `string` | "Item image" | Alternative text |
| `width` | `number \| string` | 200 | Container width |
| `height` | `number \| string` | 200 | Container height |
| `sx` | `object` | `{}` | MUI sx prop for styling |
| `onLoad` | `function` | undefined | Callback on success |
| `onError` | `function` | undefined | Callback on error |
| `showPlaceholder` | `boolean` | true | Show skeleton while loading |

## Implementation in Shopping Cart

The shopping cart component now displays item images:

```typescript
<ImageDisplay
    imagePath={item.image}
    alt={item.name}
    width={100}
    height={100}
/>
```

Images are displayed in a 100x100px box on the left side of each cart item.

## Error Handling Flow

```
User sees item in cart
    ↓
ImageDisplay component mounts
    ↓
Tries to load image via loadImage()
    ↓
Frontend tries image URL with timeout (15s)
    ↓
┌─ Success → Cache image → Display image
│
└─ Failure → Retry (up to 3 times with delay)
              ├─ Success → Cache → Display
              └─ Failure → Show error icon + message
```

## Performance Optimizations

1. **Caching**: Images cached for 24 hours in localStorage
2. **Streaming**: Backend streams images in 8KB chunks
3. **Lazy Loading**: Images load only when component mounts
4. **Exponential Backoff**: Retry delays increase (1s, 2s, 3s)
5. **Timeouts**: 15-second timeout per image load attempt
6. **CORS Preflight**: Proper CORS headers prevent browser blocking

## Network Requirements

Ensure your InvenTree instance:
1. Has the image storage directory accessible
2. Has proper read permissions on image files
3. Is reachable from the backend container
4. Returns proper `Content-Type` headers

## Troubleshooting

### Images Not Loading

1. **Check backend logs**:
   ```bash
   docker logs inventree_backend
   ```

2. **Verify InvenTree accessibility**:
   ```bash
   curl -H "Authorization: Token YOUR_TOKEN" \
        -H "Host: yourdomain.com" \
        http://inventree-server:8000/api/part/1/
   ```

3. **Check image existence**:
   - Log into InvenTree web interface
   - Navigate to part and verify image is uploaded
   - Check image path in database

### Slow Image Loading

1. Check network latency to InvenTree server
2. Verify InvenTree server resources (CPU, memory)
3. Check browser developer tools (Network tab) for actual load times
4. Consider increasing timeout if latency is high

### Images Cached Incorrectly

Clear cache programmatically:
```typescript
import { clearImageCache } from './imageHandler';

// Clear cache on app startup or when needed
clearImageCache();
```

Or manually clear browser storage:
- DevTools → Application → Local Storage → Clear All

## Future Enhancements

Possible improvements:
1. **Image Thumbnails**: Generate and cache thumbnails for faster loading
2. **Progressive JPEG**: Serve progressive JPEGs for better perceived performance
3. **WebP Support**: Serve modern formats for better compression
4. **CDN Integration**: Serve cached images from CDN
5. **Offline Support**: Service workers for offline image display
6. **Analytics**: Track image load failures and performance metrics

## API Reference

### Backend Endpoints

#### GET `/image-proxy/{image_path}`
Proxy endpoint for images from InvenTree.

**Path Parameters:**
- `image_path`: Relative path to image (e.g., `media/part_images/abc.png`)

**Query Parameters:**
None

**Response Headers:**
- `Cache-Control: public, max-age=3600`
- `Access-Control-Allow-Origin: *`
- `Content-Type: image/jpeg|png|gif|webp` (depends on image)

**Responses:**
- `200`: Image data (streamed)
- `400`: Invalid image path
- `502`: Cannot connect to InvenTree
- `504`: InvenTree server timeout
- `500`: Internal server error

**Example:**
```bash
curl http://localhost:8001/image-proxy/media/part_images/abc.png
```

### Frontend Functions

See `imageHandler.ts` for complete API documentation.
