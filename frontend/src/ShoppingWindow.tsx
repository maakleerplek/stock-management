import { useState, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import ShoppingCart, { type CartItem } from './shoppingcart';
import { type ItemData, handleTakeItem, handleAddItem, handleSetItem } from './sendCodeHandler';
import { useToast } from './ToastContext';
import { useVolunteer } from './VolunteerContext';
import { EXTRA_SERVICES } from './constants';

interface ShoppingWindowProps {
    scannedItem: ItemData | null;
    onCheckoutResultChange?: (result: { total: number; description: string } | null) => void;
}

const CART_STORAGE_KEY = 'stockManagerCartItems';

export default function ShoppingWindow({ scannedItem, onCheckoutResultChange }: ShoppingWindowProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Failed to parse cart items from local storage", e);
            return [];
        }
    });
    const [checkedOutResult, setCheckedOutResult] = useState<{ total: number; description: string } | null>(null);
    const [extraCosts, setExtraCosts] = useState<number>(0);
    const [extrasBreakdown, setExtrasBreakdown] = useState<Record<string, number>>({});
    const [isSetMode, setIsSetMode] = useState<boolean>(false);
    const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

    // Dynamic price labels for extra services
    const getExtraServicesSummary = useCallback(() => {
        return Object.entries(extrasBreakdown)
            .filter(([_, qty]) => qty > 0)
            .map(([id, qty]) => {
                const service = EXTRA_SERVICES.find(s => s.id === id);
                return service ? `${service.name} (${qty} ${service.unit})` : `${id} (${qty})`;
            }).join(', ');
    }, [extrasBreakdown]);
    const { addToast } = useToast();
    const { isVolunteerMode } = useVolunteer();

    const handleSetModeChange = useCallback((newMode: boolean) => {
        setIsSetMode(newMode);
        if (!newMode) {
            // Un-setting Set Mode should delete items that sit at 0
            setCartItems((prevItems) => prevItems.filter(item => item.cartQuantity !== 0));
        }
    }, []);

    // Notify parent component when checkout result changes
    useEffect(() => {
        if (onCheckoutResultChange) {
            onCheckoutResultChange(checkedOutResult);
        }
    }, [checkedOutResult, onCheckoutResultChange]);

    // Cleanup cart if volunteer mode is exited
    useEffect(() => {
        if (!isVolunteerMode) {
            setCartItems((prevItems) => prevItems.filter(item => item.cartQuantity > 0));
        }
    }, [isVolunteerMode]);

    // Persist cart items
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    const handleAddItemToCart = useCallback((item: ItemData) => {
        console.log('[Cart] Adding item to cart:', { id: item.id, name: item.name, price: item.price });
        setCheckedOutResult(null);
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((i) => i.id === item.id);
            if (existingItem) {
                const newQuantity = Math.min(existingItem.cartQuantity + 1, item.quantity);
                console.log(`[Cart] Incrementing quantity for ${item.name}: ${existingItem.cartQuantity} -> ${newQuantity}`);
                return prevItems.map((i) =>
                    i.id === item.id ? { ...i, cartQuantity: newQuantity } : i
                );
            }
            console.log('[Cart] New item added to cart list');
            return [...prevItems, { ...item, cartQuantity: 1 }];
        });
    }, []);

    useEffect(() => {
        if (scannedItem) {
            console.log('[Scanner] Received scanned item:', scannedItem.name);
            handleAddItemToCart(scannedItem);
        }
    }, [scannedItem, handleAddItemToCart]);


    const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
        console.log(`[Cart] Updating quantity for item ${itemId} to ${newQuantity}`);
        setCartItems((prevItems) =>
            prevItems
                .map((item) =>
                    item.id === itemId ? { ...item, cartQuantity: newQuantity } : item
                )
                .filter((item) => {
                    if (isVolunteerMode) return true;
                    const keep = item.cartQuantity !== 0;
                    if (!keep) console.log(`[Cart] Removing item ${item.name} because quantity reached 0`);
                    return keep;
                })
        );
    };

    const handleRemoveItem = (itemId: number) => {
        console.log(`[Cart] Manually removing item ${itemId}`);
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    };

    const handleCheckout = async () => {
        const checkoutTotal = cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0) + extraCosts;
        console.log('[Checkout] Starting checkout process', { 
            itemCount: cartItems.length, 
            total: checkoutTotal, 
            extraCosts,
            isVolunteerMode,
            isSetMode 
        });

        const itemsSummary = cartItems.map(item => `${item.name} x${item.cartQuantity}`).join(', ');
        const confirmMessageSummary = cartItems.map(item => `${item.name} x${item.cartQuantity}`).join('\n');
        let actionText = 'checkout';
        if (isVolunteerMode) {
            actionText = isSetMode ? 'set stock to' : 'add to stock';
        }
        const extrasSummary = getExtraServicesSummary();
        const confirmMessage = `Are you sure you want to ${actionText}?\n\n${confirmMessageSummary}${!isVolunteerMode && extraCosts > 0 ? `\n\nExtra Services: ${extrasSummary}\nCost: €${extraCosts.toFixed(2)}` : ''}${!isVolunteerMode ? `\n\nTotal: €${checkoutTotal.toFixed(2)}` : ''}`;

        if (!window.confirm(confirmMessage)) {
            console.log('[Checkout] User cancelled confirmation dialog');
            return;
        }

        setIsCheckingOut(true);
        try {
            let handler = handleTakeItem;
            if (isVolunteerMode) {
                handler = isSetMode ? handleSetItem : handleAddItem;
            }

            console.log(`[Checkout] Using handler: ${handler.name}`);

            for (const item of cartItems) {
                let success = false;
                console.log(`[Checkout] Processing item: ${item.name} (qty: ${item.cartQuantity})`);
                
                if (isVolunteerMode && !isSetMode && item.cartQuantity < 0) {
                    console.log(`[Checkout] Item quantity is negative, using handleTakeItem for ${item.name}`);
                    success = await handleTakeItem(item.id, Math.abs(item.cartQuantity));
                } else {
                    success = await handler(item.id, item.cartQuantity);
                }

                if (!success) {
                    console.error(`[Checkout] FAILED to process item: ${item.name}`);
                    const errorMsg = `Error processing item ${item.name}. Operation aborted. The cart has not been cleared.`;
                    addToast(errorMsg, 'error');
                    alert(errorMsg);
                    setIsCheckingOut(false);
                    return;
                }
                console.log(`[Checkout] Successfully processed: ${item.name}`);
            }

            console.log('[Checkout] All items processed successfully. Clearing cart.');
            setCartItems([]);
            // Only set checkout result for non-volunteer mode (when payment is needed)
            if (!isVolunteerMode) {
                let desc = itemsSummary;
                if (extraCosts > 0) {
                    desc += `, Extras: ${extrasSummary} (€${extraCosts.toFixed(2)})`;
                }
                if (desc.length > 135) {
                    desc = desc.substring(0, 132) + "...";
                }
                setCheckedOutResult({ total: checkoutTotal, description: desc });
            } else {
                setCheckedOutResult(null);
            }
        } catch (error) {
            console.error('[Checkout] Unexpected error during checkout:', error);
            addToast('An unexpected error occurred during checkout', 'error');
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <Box>
            <ShoppingCart
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
                checkedOutTotal={checkedOutResult?.total ?? null}
                onExtraCostChange={(cost, breakdown) => {
                    setExtraCosts(cost);
                    setExtrasBreakdown(breakdown);
                }}
                extraCosts={extraCosts}
                isVolunteerMode={isVolunteerMode}
                isSetMode={isSetMode}
                onSetModeChange={handleSetModeChange}
                isCheckingOut={isCheckingOut}
            />
        </Box>
    );
}
