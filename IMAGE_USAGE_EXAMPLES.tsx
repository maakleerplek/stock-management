/**
 * @file IMAGE_USAGE_EXAMPLES.tsx
 *
 * Real-world examples of how to use the ImageDisplay component
 * and image utility functions throughout your application.
 */

// ============================================================================
// EXAMPLE 1: Basic Image Display in a Product Card
// ============================================================================

import { Box, Card, CardContent, Typography } from '@mui/material';
import ImageDisplay from './ImageDisplay';

interface ProductCardProps {
    productName: string;
    productImage: string | null;
    price: number;
}

export function ProductCard({ productName, productImage, price }: ProductCardProps) {
    return (
        <Card>
            <ImageDisplay
                imagePath={productImage}
                alt={productName}
                width={250}
                height={250}
                sx={{ width: '100%' }}
            />
            <CardContent>
                <Typography variant="h6">{productName}</Typography>
                <Typography variant="body2" color="text.secondary">
                    €{price.toFixed(2)}
                </Typography>
            </CardContent>
        </Card>
    );
}

// ============================================================================
// EXAMPLE 2: Image with Loading and Error Callbacks
// ============================================================================

import { useState } from 'react';
import { Alert } from '@mui/material';

export function ProductWithFeedback({ imagePath }: { imagePath: string | null }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    return (
        <Box>
            {isLoaded && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Image loaded successfully!
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    Image failed: {error}
                </Alert>
            )}
            <ImageDisplay
                imagePath={imagePath}
                alt="Product"
                width={300}
                height={300}
                onLoad={() => setIsLoaded(true)}
                onError={(err) => setError(err)}
            />
        </Box>
    );
}

// ============================================================================
// EXAMPLE 3: Gallery with Multiple Images
// ============================================================================

import { Grid } from '@mui/material';

interface ImageGalleryProps {
    images: Array<{ id: number; path: string; name: string }>;
}

export function ImageGallery({ images }: ImageGalleryProps) {
    return (
        <Grid container spacing={2}>
            {images.map((image) => (
                <Grid item xs={12} sm={6} md={4} key={image.id}>
                    <ImageDisplay
                        imagePath={image.path}
                        alt={image.name}
                        width="100%"
                        height={250}
                        sx={{ width: '100%' }}
                    />
                </Grid>
            ))}
        </Grid>
    );
}

// ============================================================================
// EXAMPLE 4: Using Image Utility Functions Directly
// ============================================================================

import { useEffect, useState } from 'react';
import { getImageUrl, preloadImages } from './imageHandler';

export function SmartImageLoader() {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get image URL for direct use in img element
        getImageUrl('media/part_images/product.png').then((url) => {
            setImageUrl(url);
            setLoading(false);
        });
    }, []);

    if (loading) return <div>Loading...</div>;
    if (!imageUrl) return <div>Image not available</div>;

    return <img src={imageUrl} alt="Product" style={{ width: 200, height: 200 }} />;
}

// ============================================================================
// EXAMPLE 5: Preload Images on App Startup
// ============================================================================

import { useEffect } from 'react';
import { preloadImages } from './imageHandler';

export function AppInitializer() {
    useEffect(() => {
        // Preload commonly used product images
        const commonImages = [
            'media/part_images/featured_1.png',
            'media/part_images/featured_2.png',
            'media/part_images/featured_3.png',
        ];

        preloadImages(commonImages).then(() => {
            console.log('Featured images preloaded');
        });
    }, []);

    return null; // This is just for initialization
}

// ============================================================================
// EXAMPLE 6: Shopping Cart Item with Image (Real Usage)
// ============================================================================

import { ListItem, ListItemText, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface CartItemProps {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string | null;
    quantity: number;
    onRemove: (id: number) => void;
}

export function CartItemWithImage({
    id,
    name,
    description,
    price,
    image,
    quantity,
    onRemove,
}: CartItemProps) {
    return (
        <ListItem
            sx={{
                display: 'flex',
                gap: 2,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
            }}
        >
            {/* Image on the left */}
            <Box sx={{ flexShrink: 0 }}>
                <ImageDisplay imagePath={image} alt={name} width={80} height={80} />
            </Box>

            {/* Product info in the middle */}
            <ListItemText
                primary={name}
                secondary={
                    <>
                        <Typography variant="body2" color="text.secondary">
                            {description}
                        </Typography>
                        <Typography variant="body2">
                            Qty: {quantity} × €{price.toFixed(2)}
                        </Typography>
                    </>
                }
                sx={{ flex: 1 }}
            />

            {/* Delete button on the right */}
            <IconButton
                color="error"
                onClick={() => onRemove(id)}
                sx={{ flexShrink: 0 }}
            >
                <DeleteIcon />
            </IconButton>
        </ListItem>
    );
}

// ============================================================================
// EXAMPLE 7: Conditional Image Display with Skeleton
// ============================================================================

import { Skeleton, Box } from '@mui/material';

interface ConditionalImageProps {
    imagePath: string | null;
    fallbackText: string;
}

export function ConditionalImage({ imagePath, fallbackText }: ConditionalImageProps) {
    return imagePath ? (
        <ImageDisplay imagePath={imagePath} alt={fallbackText} width={200} height={200} />
    ) : (
        <Box
            sx={{
                width: 200,
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'action.disabledBackground',
                borderRadius: 1,
            }}
        >
            <Typography color="text.disabled">{fallbackText}</Typography>
        </Box>
    );
}

// ============================================================================
// EXAMPLE 8: Image with Custom Error Recovery
// ============================================================================

import { useState } from 'react';
import { Button } from '@mui/material';
import { clearImageCache } from './imageHandler';

export function ImageWithRetry({ imagePath }: { imagePath: string | null }) {
    const [retryCount, setRetryCount] = useState(0);

    const handleRetry = () => {
        // Clear cache for this image and reload
        clearImageCache();
        setRetryCount((prev) => prev + 1);
    };

    return (
        <Box>
            <ImageDisplay
                key={retryCount} // Force re-render on retry
                imagePath={imagePath}
                alt="Product"
                width={300}
                height={300}
                onError={() => {
                    if (retryCount < 2) {
                        console.log('Image failed, offering retry...');
                    }
                }}
            />
            {retryCount < 2 && (
                <Button onClick={handleRetry} sx={{ mt: 2 }}>
                    Clear Cache and Retry
                </Button>
            )}
        </Box>
    );
}

// ============================================================================
// EXAMPLE 9: Responsive Image Grid
// ============================================================================

import { Box, Grid } from '@mui/material';

interface ResponsiveGalleryProps {
    items: Array<{
        id: number;
        name: string;
        image: string | null;
    }>;
}

export function ResponsiveGallery({ items }: ResponsiveGalleryProps) {
    return (
        <Grid container spacing={2}>
            {items.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                    <Box sx={{ textAlign: 'center' }}>
                        <ImageDisplay
                            imagePath={item.image}
                            alt={item.name}
                            width="100%"
                            height={200}
                            sx={{ width: '100%' }}
                        />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {item.name}
                        </Typography>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
}

// ============================================================================
// EXAMPLE 10: Image in Modal Dialog
// ============================================================================

import { Dialog, DialogContent, DialogTitle } from '@mui/material';

interface ImageModalProps {
    open: boolean;
    onClose: () => void;
    image: string | null;
    title: string;
}

export function ImageModal({ open, onClose, image, title }: ImageModalProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md">
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <ImageDisplay
                    imagePath={image}
                    alt={title}
                    width="100%"
                    height={500}
                    sx={{ width: '100%', mt: 2 }}
                />
            </DialogContent>
        </Dialog>
    );
}

// ============================================================================
// SUMMARY OF USAGE PATTERNS
// ============================================================================

/*
KEY PATTERNS:

1. BASIC USAGE:
   <ImageDisplay imagePath={path} alt="Description" width={200} height={200} />

2. WITH CALLBACKS:
   <ImageDisplay
       imagePath={path}
       onLoad={() => console.log('loaded')}
       onError={(err) => console.log('error:', err)}
   />

3. PRELOAD MULTIPLE:
   useEffect(() => {
       preloadImages(['path1', 'path2', 'path3']);
   }, []);

4. GET URL DIRECTLY:
   const url = await getImageUrl(imagePath);

5. CLEAR CACHE:
   clearImageCache();

6. RESPONSIVE:
   <ImageDisplay width="100%" height={250} sx={{ width: '100%' }} />

7. ERROR STATES:
   Use onError callback to show retry button or fallback UI

8. GALLERIES:
   Map over array and wrap each ImageDisplay in Grid item

9. CONDITIONAL:
   Use ternary to show placeholder if imagePath is null

10. WITH KEY:
    Use key prop when retrying to force re-render
*/
