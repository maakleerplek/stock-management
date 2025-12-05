/**
 * @file ImageDisplay.tsx
 * 
 * Reusable component for displaying images with loading states, error handling,
 * and automatic retry logic.
 */

import { useEffect, useState } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import { loadImage } from './imageHandler';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface ImageDisplayProps {
    /** Relative path to the image (e.g., "media/part_images/abc.png") */
    imagePath: string | null;
    /** Alternative text for accessibility */
    alt?: string;
    /** Width of the image container */
    width?: number | string;
    /** Height of the image container */
    height?: number | string;
    /** CSS styles for the container */
    sx?: any;
    /** Callback when image loads successfully */
    onLoad?: () => void;
    /** Callback when image fails to load */
    onError?: (error: string) => void;
    /** Show placeholder while loading */
    showPlaceholder?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ImageDisplay Component
 * 
 * Displays images from InvenTree with robust error handling:
 * - Shows loading skeleton while fetching
 * - Displays fallback icon on failure
 * - Implements retry logic automatically
 * - Caches successful images
 * - Properly cleans up blob URLs on unmount to prevent memory leaks
 * 
 * @example
 * <ImageDisplay
 *   imagePath="media/part_images/part_123.png"
 *   alt="Part image"
 *   width={200}
 *   height={200}
 * />
 */
export default function ImageDisplay({
    imagePath,
    alt = 'Item image',
    width = 200,
    height = 200,
    sx = {},
    onLoad,
    onError,
    showPlaceholder = true,
}: ImageDisplayProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Reset state when imagePath changes
        setIsLoading(true);
        setError(null);
        
        // Cleanup: revoke old blob URL before loading new one (not data URLs)
        if (imageUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(imageUrl);
        }
        setImageUrl(null);

        // Don't load if no path provided
        if (!imagePath) {
            setIsLoading(false);
            setError('No image provided');
            onError?.('No image path');
            return;
        }

        // Load the image
        const loadImg = async () => {
            try {
                const result = await loadImage(imagePath);

                if (result.success && result.url) {
                    setImageUrl(result.url);
                    setError(null);
                    onLoad?.();
                } else {
                    const errorMsg = result.error || 'Failed to load image';
                    setError(errorMsg);
                    onError?.(errorMsg);
                }
            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                setError(errorMsg);
                onError?.(errorMsg);
            } finally {
                setIsLoading(false);
            }
        };

        loadImg();

        // Cleanup function: revoke blob URL when component unmounts (not data URLs)
        return () => {
            if (imageUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imagePath, onLoad, onError]);

    // ========================================================================
    // RENDER STATES
    // ========================================================================

    // Loading state
    if (isLoading && showPlaceholder) {
        return (
            <Skeleton
                variant="rectangular"
                width={width}
                height={height}
                sx={{
                    borderRadius: 1,
                    ...sx,
                }}
            />
        );
    }

    // Error state
    if (error) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width,
                    height,
                    backgroundColor: 'action.disabledBackground',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    gap: 1,
                    ...sx,
                }}
            >
                <ImageNotSupportedIcon
                    sx={{
                        fontSize: 40,
                        color: 'text.disabled',
                    }}
                />
                <Typography variant="caption" color="text.disabled" align="center" sx={{ px: 1 }}>
                    {error}
                </Typography>
            </Box>
        );
    }

    // Success state
    if (imageUrl) {
        return (
            <Box
                component="img"
                src={imageUrl}
                alt={alt}
                onError={() => {
                    console.warn(`Image failed to render even after successful load: ${imagePath}`);
                    setError('Image failed to render');
                }}
                sx={{
                    width,
                    height,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.default',
                    ...sx,
                }}
            />
        );
    }
}
