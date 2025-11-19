import { useState, useCallback } from 'react';
import './App.css';
import Scanner from './barcodescanner';
import Qrcode from './qrcode';
import Logo from './logo';
import ShoppingCart, { type CartItem } from './shoppingcart';
import { type ItemData, handleTakeItem } from './sendCodeHandler';
import TestingTerminal from './testing-terminal';

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [checkedOutTotal, setCheckedOutTotal] = useState<number | null>(null);

  /** Add a log message to the terminal */
  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
  }, []);

  /** Add or increment an item in the shopping cart */
  const handleAddItemToCart = (item: ItemData) => {
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
  };

  /** Update the quantity of an item in the cart, removing it if quantity reaches 0 */
  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === itemId ? { ...item, cartQuantity: newQuantity } : item
        )
        .filter((item) => item.cartQuantity > 0)
    );
  };

  /** Remove an item from the cart (local only, no inventory change) */
  const handleRemoveItem = (itemId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    const item = cartItems.find((i) => i.id === itemId);
    if (item) {
      addLog(`Removed "${item.name}" from cart.`);
    }
  };

  const handleCheckout = async () => {
    const checkoutTotal = cartItems.reduce((total, item) => total + item.price * item.cartQuantity, 0);
    
    // Show confirmation popup
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
    setCartItems([]); // Clear the cart
    setCheckedOutTotal(checkoutTotal); // Set the total to be displayed
  };

  return (
    <div className="App">
      <div className="main-layout">
        <div className="content-area">
          <Logo />
          <TestingTerminal logs={logs} />
          <Scanner addLog={addLog} onItemScanned={handleAddItemToCart} />
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
    </div>
  );
}

export default App;
