import { type ItemData } from './sendCodeHandler';
import './shoppingcart.css';

export interface CartItem extends ItemData {
    cartQuantity: number;
}

interface ShoppingCartProps {
    cartItems: CartItem[];
    onUpdateQuantity: (itemId: number, newQuantity: number) => void;
    onRemoveItem: (itemId: number) => void;
    onCheckout: () => void;
    checkedOutTotal: number | null;
}

function ShoppingCart({
    cartItems,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    checkedOutTotal,
}: ShoppingCartProps) {
    const totalPrice = cartItems.reduce(
        (total, item) => total + item.price * item.cartQuantity,
        0
    );

    // Don't render if cart is empty and no recent checkout
    if (cartItems.length === 0 && checkedOutTotal === null) {
        return null;
    }

    return (
        <div className="shopping-cart">
            <h2>Shopping Cart</h2>
            {cartItems.length > 0 ? (
                <>
                    <ul>
                        {cartItems.map((item) => (
                            <li key={item.id}>
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p>{item.description}</p>
                                    <p>Price: €{item.price.toFixed(2)}</p>
                                    <p>In Stock: {item.quantity}</p>
                                </div>
                                <div className="item-controls">
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() =>
                                                onUpdateQuantity(item.id, item.cartQuantity - 1)
                                            }
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            value={item.cartQuantity}
                                            onChange={(e) =>
                                                onUpdateQuantity(
                                                    item.id,
                                                    Math.min(
                                                        parseInt(e.target.value, 10) || 0,
                                                        item.quantity
                                                    )
                                                )
                                            }
                                            min="1"
                                            max={item.quantity}
                                        />
                                        <button
                                            onClick={() =>
                                                onUpdateQuantity(item.id, item.cartQuantity + 1)
                                            }
                                            disabled={item.cartQuantity >= item.quantity}
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button
                                        className="remove-btn"
                                        onClick={() => onRemoveItem(item.id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="total-price">
                        <h3>Total: €{totalPrice.toFixed(2)}</h3>
                    </div>
                    <button className="checkout-btn" onClick={onCheckout}>
                        Checkout
                    </button>
                </>
            ) : (
                <div className="checked-out-summary">
                    <p>✓ Checkout successful!</p>
                    <div className="total-price">
                        <h3>Final Total: €{checkedOutTotal?.toFixed(2)}</h3>
                    </div>
                    <p>Scan a new item to begin a new transaction.</p>
                </div>
            )}
        </div>
    );
}

export default ShoppingCart;