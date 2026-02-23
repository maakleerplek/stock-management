import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ShoppingCart, { type CartItem } from './shoppingcart';
import { type ItemData, handleTakeItem, handleAddItem, handleSetItem } from './sendCodeHandler';
import { useToast } from './ToastContext';
import { useVolunteer } from './VolunteerContext';

interface ShoppingWindowProps {
    scannedItem: ItemData | null;
    onCheckoutTotalChange?: (total: number | null) => void;
}

const CART_STORAGE_KEY = 'stockManagerCartItems';

export default function ShoppingWindow({ scannedItem, onCheckoutTotalChange }: ShoppingWindowProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Failed to parse cart items from local storage", e);
            return [];
        }
    });
    const [checkedOutTotal, setCheckedOutTotal] = useState<number | null>(null);
    const [extraCosts, setExtraCosts] = useState<number>(0);
    const [isSetMode, setIsSetMode] = useState<boolean>(false);
    const { addToast } = useToast();
    const { isVolunteerMode } = useVolunteer();

    const handleSetModeChange = useCallback((newMode: boolean) => {
        setIsSetMode(newMode);
        if (!newMode) {
            // Un-setting Set Mode should delete items that sit at 0
            setCartItems((prevItems) => prevItems.filter(item => item.cartQuantity !== 0));
        }
    }, []);

    // Notify parent component when checkout total changes
    useEffect(() => {
        if (onCheckoutTotalChange) {
            onCheckoutTotalChange(checkedOutTotal);
        }
    }, [checkedOutTotal, onCheckoutTotalChange]);

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
        setCheckedOutTotal(null);
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((i) => i.id === item.id);
            if (existingItem) {
                const newQuantity = Math.min(existingItem.cartQuantity + 1, item.quantity);
                addToast(`Added ${item.name} (qty: ${newQuantity})`, 'success');
                return prevItems.map((i) =>
                    i.id === item.id ? { ...i, cartQuantity: newQuantity } : i
                );
            }
            addToast(`Added ${item.name} to cart`, 'success');
            return [...prevItems, { ...item, cartQuantity: 1 }];
        });
    }, [addToast]);

    useEffect(() => {
        if (scannedItem) {
            handleAddItemToCart(scannedItem);
        }
    }, [scannedItem, handleAddItemToCart]);


    const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
        setCartItems((prevItems) =>
            prevItems
                .map((item) =>
                    item.id === itemId ? { ...item, cartQuantity: newQuantity } : item
                )
                .filter((item) => {
                    // Only volunteer mode allows holding items with 0 stock
                    if (isVolunteerMode) return true;
                    return item.cartQuantity !== 0;
                })
        );
    };

    const handleRemoveItem = (itemId: number) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    };

    const handleCheckout = async () => {
        const checkoutTotal = cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0) + extraCosts;

        const itemsSummary = cartItems.map(item => `${item.name} x${item.cartQuantity}`).join('\n');
        let actionText = 'checkout';
        if (isVolunteerMode) {
            actionText = isSetMode ? 'set stock to' : 'add to stock';
        }
        const confirmMessage = `Are you sure you want to ${actionText}?\n\n${itemsSummary}${!isVolunteerMode ? `\n\nExtra Services: €${extraCosts.toFixed(2)}\nTotal: €${checkoutTotal.toFixed(2)}` : ''}`;

        if (!window.confirm(confirmMessage)) {
            addToast(`${actionText} cancelled`, 'info');
            return;
        }

        addToast(`Processing ${isVolunteerMode ? (isSetMode ? 'set' : 'add') : 'checkout'}...`, 'info');

        let handler = handleTakeItem;
        if (isVolunteerMode) {
            handler = isSetMode ? handleSetItem : handleAddItem;
        }

        for (const item of cartItems) {
            let success = false;
            if (isVolunteerMode && !isSetMode && item.cartQuantity < 0) {
                // Going negative in add mode automatically switches to remove
                success = await handleTakeItem(item.id, Math.abs(item.cartQuantity));
            } else {
                success = await handler(item.id, item.cartQuantity);
            }

            if (!success) {
                const errorMsg = `Error processing item ${item.name}. Operation aborted. The cart has not been cleared.`;
                addToast(errorMsg, 'error');
                alert(errorMsg);
                return;
            }
        }

        addToast(`✓ ${isVolunteerMode ? (isSetMode ? 'Stock quantities set!' : 'Items added to stock!') : `Checkout complete! Total: €${checkoutTotal.toFixed(2)}`}`, 'success');
        setCartItems([]);
        // Only set checkout total for non-volunteer mode (when payment is needed)
        if (!isVolunteerMode) {
            setCheckedOutTotal(checkoutTotal);
        } else {
            setCheckedOutTotal(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <ShoppingCart
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout}
                checkedOutTotal={checkedOutTotal}
                onExtraCostChange={setExtraCosts}
                extraCosts={extraCosts}
                isVolunteerMode={isVolunteerMode}
                isSetMode={isSetMode}
                onSetModeChange={handleSetModeChange}
            />
        </motion.div>
    );
}
