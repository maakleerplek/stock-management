import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ShoppingCart, { type CartItem } from './shoppingcart';
import { type ItemData, handleTakeItem } from './sendCodeHandler';
import { useToast } from './ToastContext';

interface ShoppingWindowProps {
    addLog: (msg: string) => void;
    scannedItem: ItemData | null;
}

export default function ShoppingWindow({ addLog, scannedItem }: ShoppingWindowProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [checkedOutTotal, setCheckedOutTotal] = useState<number | null>(null);
    const [extraCosts, setExtraCosts] = useState<number>(0);
    const { addToast } = useToast();

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
                .filter((item) => item.cartQuantity > 0)
        );
    };

    const handleRemoveItem = (itemId: number) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
        const item = cartItems.find((i) => i.id === itemId);
        if (item) {
            addLog(`Removed "${item.name}" from cart.`);
        }
    };

    const handleCheckout = async () => {
        const checkoutTotal = cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0) + extraCosts;

        const itemsSummary = cartItems.map(item => `${item.name} x${item.cartQuantity}`).join('\n');
        const confirmMessage = `Are you sure you want to checkout?\n\n${itemsSummary}\n\nExtra Services: €${extraCosts.toFixed(2)}\nTotal: €${checkoutTotal.toFixed(2)}`;

        if (!window.confirm(confirmMessage)) {
            addLog("Checkout cancelled.");
            addToast("Checkout cancelled", 'info');
            return;
        }

        addLog("Checking out all items in the cart...");
        addToast("Processing checkout...", 'info');

        for (const item of cartItems) {
            const success = await handleTakeItem(item.id, item.cartQuantity, addLog);
            if (!success) {
                const errorMsg = `Error processing item ${item.name}. Checkout aborted. The cart has not been cleared.`;
                addLog(errorMsg);
                addToast(errorMsg, 'error');
                alert(errorMsg); // Inform user
                return;
            }
        }

        addLog("All items checked out successfully.");
        addToast(`✓ Checkout complete! Total: €${checkoutTotal.toFixed(2)}`, 'success');
        setCartItems([]);
        setCheckedOutTotal(checkoutTotal);
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
            />
        </motion.div>
    );
}
