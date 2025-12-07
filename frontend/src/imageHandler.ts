/**
 * @file imageHandler.ts
 * 
 * Utilities for robust image loading with retry logic, caching, and fallbacks.
 * Handles network failures gracefully and provides progress tracking.
 */

import { API_BASE_URL } from './sendCodeHandler';

// ============================================================================
// CONSTANTS
// ============================================================================

const IMAGE_CACHE_PREFIX = 'img_cache_';
const IMAGE_RETRY_ATTEMPTS = 3;
const IMAGE_RETRY_DELAY = 1000; // ms
const IMAGE_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms
const IMAGE_LOAD_TIMEOUT = 15000; // 15 seconds

// ============================================================================
// TYPES
// ============================================================================

export interface ImageLoadResult {
    success: boolean;
    url?: string;
    error?: string;
    fromCache?: boolean;
}

export interface CachedImage {
    data: string; // base64 encoded data URL
    timestamp: number;
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Get a cached image from localStorage
 * Note: Blob URLs are session-only and cannot be stored in localStorage.
 * This cache stores proxy URLs instead, which need to be fetched again when retrieved.
 * @param imageKey - Unique key for the image
 * @returns Cached proxy URL or null if expired/not found
 */
function getCachedImage(imageKey: string): string | null {
    try {
        const cached = localStorage.getItem(IMAGE_CACHE_PREFIX + imageKey);
        if (!cached) return null;

        const parsed: CachedImage = JSON.parse(cached);
        const now = Date.now();

        // Check if cache has expired
        if (now - parsed.timestamp > IMAGE_CACHE_DURATION) {
            localStorage.removeItem(IMAGE_CACHE_PREFIX + imageKey);
            return null;
        }

        // Return cached proxy URL (will need to be fetched again for blob creation)
        return parsed.data;
    } catch (error) {
        console.warn(`Error retrieving cached image ${imageKey}:`, error);
        return null;
    }
}

/**
 * Store an image in localStorage cache
 * @param imageKey - Unique key for the image
 * @param dataUrl - Base64 encoded data URL
 */
function setCachedImage(imageKey: string, dataUrl: string): void {
    try {
        const cacheData: CachedImage = {
            data: dataUrl,
            timestamp: Date.now(),
        };
        localStorage.setItem(IMAGE_CACHE_PREFIX + imageKey, JSON.stringify(cacheData));
    } catch (error) {
        // Silently fail if localStorage is full or unavailable
        console.warn(`Could not cache image ${imageKey}:`, error);
    }
}

/**
 * Clear all cached images
 */
export function clearImageCache(): void {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
            if (key.startsWith(IMAGE_CACHE_PREFIX)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.warn('Error clearing image cache:', error);
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================



// ============================================================================
// IMAGE LOADING WITH RETRY
// ============================================================================

/**
 * Load image with retry logic - converts blob to data URL
 * Data URLs can be reliably displayed in <img> tags
 * @param url - Proxy URL to load
 * @param maxRetries - Maximum number of retry attempts
 * @param timeout - Maximum time to wait for image load
 * @returns Promise that resolves with data URL
 */
function loadImageWithRetry(
    url: string,
    maxRetries: number = IMAGE_RETRY_ATTEMPTS,
    timeout: number = IMAGE_LOAD_TIMEOUT
): Promise<string> {
    return new Promise((resolve, reject) => {
        let attempt = 0;

        const tryLoad = () => {
            attempt++;
            let timeoutId: ReturnType<typeof setTimeout> | null = null;

            const cleanup = () => {
                if (timeoutId) clearTimeout(timeoutId);
            };

            const handleError = (error: Error) => {
                cleanup();
                console.warn(`Image load attempt ${attempt}/${maxRetries} failed:`, error.message);
                if (attempt < maxRetries) {
                    const delay = IMAGE_RETRY_DELAY * attempt;
                    console.log(`Retrying in ${delay}ms...`);
                    setTimeout(tryLoad, delay);
                } else {
                    reject(new Error(`Failed to load image after ${maxRetries} attempts: ${error.message}`));
                }
            };

            timeoutId = setTimeout(() => {
                cleanup();
                handleError(new Error('Load timeout'));
            }, timeout);

            // Fetch the image blob and convert to data URL
            fetch(url, { 
                method: 'GET',
                credentials: 'include'
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    console.log(`Response OK, Content-Type: ${response.headers.get('content-type')}`);
                    return response.blob();
                })
                .then((blob) => {
                    // Validate blob
                    if (!blob || blob.size === 0) {
                        throw new Error(`Empty blob received (size: ${blob?.size || 0})`);
                    }
                    
                    console.log(`Blob received: type="${blob.type}", size=${blob.size}`);
                    
                    // Convert blob to data URL for reliable rendering
                    const reader = new FileReader();
                    
                    reader.onload = () => {
                        cleanup();
                        const dataUrl = reader.result as string;
                        console.log(`Image converted to data URL (${dataUrl.length} chars), preview: ${dataUrl.substring(0, 100)}...`);
                        resolve(dataUrl);
                    };
                    
                    reader.onerror = () => {
                        cleanup();
                        handleError(new Error(`FileReader error: ${reader.error}`));
                    };
                    
                    console.log(`Converting blob to data URL (blob size: ${blob.size} bytes)...`);
                    reader.readAsDataURL(blob);
                })
                .catch((error) => {
                    handleError(error);
                });
        };

        tryLoad();
    });
}

// ============================================================================
// MAIN IMAGE LOADING FUNCTION
// ============================================================================

/**
 * Load an image from InvenTree with fallback strategies.
 * Implements caching, retries, and proper URL construction.
 * Returns a data URL that can be reliably displayed in an <img> tag.
 *
 * @param imageRelativePath - Relative path to image (e.g., "media/part_images/abc.png")
 * @returns ImageLoadResult with data URL or error information
 *
 * @example
 * const result = await loadImage("media/part_images/part_123.png");
 * if (result.success) {
 *   imgElement.src = result.url;  // Use data URL directly
 * } else {
 *   console.error(result.error);
 * }
 */
export async function loadImage(imageRelativePath: string | null): Promise<ImageLoadResult> {
    // Handle null/empty image path
    if (!imageRelativePath || imageRelativePath.trim() === '') {
        return {
            success: false,
            error: 'No image path provided',
        };
    }

    // Create a cache key from the image path
    const cacheKey = btoa(imageRelativePath); // Base64 encode for safe key

    // Check cache first - cache stores the data URL
    const cachedDataUrl = getCachedImage(cacheKey);
    if (cachedDataUrl) {
        console.log(`Found cached image, using data URL (${cachedDataUrl.length} chars)`);
        return {
            success: true,
            url: cachedDataUrl,
            fromCache: true,
        };
    }

    try {
        // Construct the proxy URL - DO NOT double encode
        const cleanPath = imageRelativePath.startsWith('/') 
            ? imageRelativePath.substring(1) 
            : imageRelativePath;
        
        // Use only one level of encoding - FastAPI will decode it
        const proxiedUrl = `${API_BASE_URL}/image-proxy/${cleanPath}`;

        console.log(`Loading image from proxy: ${proxiedUrl}`);

        // Load the image as data URL with retries
        const dataUrl = await loadImageWithRetry(proxiedUrl);

        // Cache the data URL for future reference
        setCachedImage(cacheKey, dataUrl);

        console.log(`Successfully loaded image (data URL: ${dataUrl.length} chars)`);

        return {
            success: true,
            url: dataUrl,  // Return the data URL for direct <img> tag use
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error loading image';
        console.error(`Failed to load image: ${imageRelativePath}`, errorMessage);

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Get image URL for display with loading verification
 * Returns the properly formatted URL or empty string on failure
 *
 * @param imageRelativePath - Relative path to image
 * @returns Promise that resolves to URL string or empty string
 */
export async function getImageUrl(imageRelativePath: string | null): Promise<string> {
    if (!imageRelativePath) return '';

    const result = await loadImage(imageRelativePath);
    return result.success && result.url ? result.url : '';
}

/**
 * Convert image file to data URL for caching
 * Useful for pre-caching images
 */
export async function imageToDataUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL());
        };

        img.onerror = () => {
            reject(new Error(`Failed to convert image: ${url}`));
        };

        img.src = url;
    });
}

/**
 * Preload multiple images to cache them
 * Useful for improving perceived performance
 */
export async function preloadImages(imagePaths: (string | null)[]): Promise<void> {
    const promises = imagePaths
        .filter((path): path is string => path !== null && path !== '')
        .map((path) => loadImage(path));

    try {
        await Promise.allSettled(promises);
    } catch (error) {
        console.warn('Some images failed to preload:', error);
    }
}
