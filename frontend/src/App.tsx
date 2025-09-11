import { useState, useCallback } from 'react';
import './App.css'
import Scanner from './barcodescanner'
import Qrcode from './qrcode'
import Logo from './logo'
import ShoppingCart, { type CartItem } from './shoppingcart'
import { type ItemData, handleTakeItem } from './sendCodeHandler';

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [checkedOutTotal, setCheckedOutTotal] = useState<number | null>(null);

  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
  }, []);

  const handleAddItemToCart = (item: ItemData) => {
    setCheckedOutTotal(null); // Reset checked out total on new scan
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
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === itemId ? { ...item, cartQuantity: newQuantity } : item
        )
        .filter((item) => item.cartQuantity > 0)
    );
  };

  const handleRemoveItem = async (itemId: number) => {
    const itemToRemove = cartItems.find(item => item.id === itemId);
    if (!itemToRemove) return;

    const quantityToTake = itemToRemove.cartQuantity;
    const success = await handleTakeItem(itemId, quantityToTake, addLog);

    if (success) {
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      addLog(`Item ${itemId} with quantity ${quantityToTake} successfully taken from stock and removed from cart.`);
    } else {
      addLog(`Failed to take item ${itemId} from stock. Item not removed from cart.`);
    }
  };

  const handleCheckout = async () => {
    addLog("Checking out all items in the cart...");
    const checkoutTotal = cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0);

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
    setCartItems([]); // Clear the cart
    setCheckedOutTotal(checkoutTotal); // Set the total to be displayed
  };

  return (
    <div className="App">
      <div className="main-layout">
        <div className="content-area">
          <Logo />
          <Scanner logs={logs} addLog={addLog} onItemScanned={handleAddItemToCart} />
          <Qrcode />
        </div>
        <ShoppingCart
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
          checkedOutTotal={checkedOutTotal}
        />
      </div>
      <footer>
      </footer>
    </div>
  )
}
export default App
