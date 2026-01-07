/**
 * @file imageHandler.ts
 * 
 * Simplified image loading from InvenTree via backend proxy.
 * Removed caching to avoid issues with invalid cached data.
 */

import { API_BASE_URL } from './sendCodeHandler';

// ============================================================================
// CONSTANTS
// ============================================================================

const IMAGE_RETRY_ATTEMPTS = 2;
const IMAGE_RETRY_DELAY = 500; // ms
const IMAGE_LOAD_TIMEOUT = 10000; // 10 seconds

// ============================================================================
// TYPES
// ============================================================================

export interface ImageLoadResult {
    success: boolean;
    url?: string;
    error?: string;
}

// ============================================================================
// HELPER: Sleep function
// ============================================================================

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// IMAGE LOADING
// ============================================================================

/**
 * Load an image from InvenTree via the backend proxy.
 * Converts the response to a data URL for reliable rendering.
 * 
 * @param imageRelativePath - Relative path to image (e.g., "media/part_images/abc.png")
 * @returns ImageLoadResult with data URL or error information
 */
export async function loadImage(imageRelativePath: string | null): Promise<ImageLoadResult> {
    // Handle null/empty image path
    if (!imageRelativePath || imageRelativePath.trim() === '') {
        return {
            success: false,
            error: 'No image path provided',
        };
    }

    // Construct the proxy URL
    const cleanPath = imageRelativePath.startsWith('/') 
        ? imageRelativePath.substring(1) 
        : imageRelativePath;
    
    const proxiedUrl = `${API_BASE_URL}/image-proxy/${cleanPath}`;

    // Attempt to load with retries
    let lastError = '';
    for (let attempt = 1; attempt <= IMAGE_RETRY_ATTEMPTS; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), IMAGE_LOAD_TIMEOUT);

            const response = await fetch(proxiedUrl, {
                method: 'GET',
                credentials: 'include',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Check for HTTP errors
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Get content type and validate it's an image
            const contentType = response.headers.get('content-type') || '';
            
            // CRITICAL: Reject HTML responses (error pages, login redirects)
            if (contentType.includes('text/html')) {
                throw new Error('Server returned HTML instead of image');
            }

            // Validate it looks like an image
            const isImage = contentType.startsWith('image/') || 
                           contentType === 'application/octet-stream';
            
            if (!isImage) {
                console.warn(`Unexpected content type for image: ${contentType}`);
            }

            // Get the blob
            const blob = await response.blob();

            if (!blob || blob.size === 0) {
                throw new Error('Empty response received');
            }

            // Convert blob to data URL
            const dataUrl = await blobToDataUrl(blob);
            
            return {
                success: true,
                url: dataUrl,
            };

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            lastError = errorMsg;
            
            console.warn(`Image load attempt ${attempt}/${IMAGE_RETRY_ATTEMPTS} failed for ${cleanPath}: ${errorMsg}`);
            
            // Don't retry if it's a definitive error (404, HTML response)
            if (errorMsg.includes('404') || errorMsg.includes('HTML instead')) {
                break;
            }
            
            // Wait before retry (except on last attempt)
            if (attempt < IMAGE_RETRY_ATTEMPTS) {
                await sleep(IMAGE_RETRY_DELAY * attempt);
            }
        }
    }

    return {
        success: false,
        error: lastError || 'Failed to load image',
    };
}

/**
 * Convert a Blob to a data URL
 */
function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
            const result = reader.result as string;
            // Final validation: ensure we got an image data URL
            if (result.startsWith('data:text/html')) {
                reject(new Error('Received HTML content instead of image'));
                return;
            }
            resolve(result);
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read image data'));
        };
        
        reader.readAsDataURL(blob);
    });
}

/**
 * Get image URL for display with loading verification
 * Returns the properly formatted URL or empty string on failure
 */
export async function getImageUrl(imageRelativePath: string | null): Promise<string> {
    if (!imageRelativePath) return '';

    const result = await loadImage(imageRelativePath);
    return result.success && result.url ? result.url : '';
}

/**
 * Clear all cached images from localStorage
 * (Legacy function - caching has been removed but kept for API compatibility)
 */
export function clearImageCache(): void {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
            if (key.startsWith('img_cache_')) {
                localStorage.removeItem(key);
            }
        });
        console.log('Image cache cleared');
    } catch (error) {
        console.warn('Error clearing image cache:', error);
    }
}

/**
 * Preload multiple images
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
