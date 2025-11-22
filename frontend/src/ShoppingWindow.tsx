import { useState, useEffect, useCallback } from 'react';
import ShoppingCart, { type CartItem } from './shoppingcart';
import { type ItemData, handleTakeItem } from './sendCodeHandler';

interface ShoppingWindowProps {
    addLog: (msg: string) => void;
    scannedItem: ItemData | null;
}

export default function ShoppingWindow({ addLog, scannedItem }: ShoppingWindowProps) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [checkedOutTotal, setCheckedOutTotal] = useState<number | null>(null);

    const handleAddItemToCart = useCallback((item: ItemData) => {
        setCheckedOutTotal(null);
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((i) => i.id === item.id);
            if (existingItem) {
                const newQuantity = Math.min(existingItem.cartQuantity + 1, item.quantity);
                return prevItems.map((i) =>
                    i.id === item.id ? { ...i, cartQuantity: newQuantity } : i
                );
            }
            return [...prevItems, { ...item, cartQuantity: 1 }];
        });
    }, []);

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
        const checkoutTotal = cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0);

        const itemsSummary = cartItems.map(item => `${item.name} x${item.cartQuantity}`).join('\n');
        const confirmMessage = `Are you sure you want to checkout?\n\n${itemsSummary}\n\nTotal: €${checkoutTotal.toFixed(2)}`;

        if (!window.confirm(confirmMessage)) {
            addLog("Checkout cancelled.");
            return;
        }

        addLog("Checking out all items in the cart...");

        for (const item of cartItems) {
            const success = await handleTakeItem(item.id, item.cartQuantity, addLog);
            if (!success) {
                const errorMsg = `Error processing item ${item.name}. Checkout aborted. The cart has not been cleared.`;
                addLog(errorMsg);
                alert(errorMsg); // Inform user
                return;
            }
        }

        addLog("All items checked out successfully.");
        setCartItems([]);
        setCheckedOutTotal(checkoutTotal);
    };

    return (
        <ShoppingCart
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
            checkedOutTotal={checkedOutTotal}
        />
    );
}
