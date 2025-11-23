import { type ItemData, API_BASE_URL } from './sendCodeHandler';
import './shoppingcart.css';
import Extras from './Extras'; // Assuming Extras component is correctly imported
import ShoppingCartIcon from './assets/Shopping cart.svg?react';
import TrashIcon from './assets/Trash.svg?react'; // Placeholder for missing trash icon

export interface CartItem extends ItemData {
    cartQuantity: number;
}

interface ShoppingCartProps {
    cartItems: CartItem[];
    onUpdateQuantity: (itemId: number, newQuantity: number) => void;
    onRemoveItem: (itemId: number) => void;
    onCheckout: () => void;
    checkedOutTotal: number | null;
    onExtraCostChange: (cost: number) => void;
    extraCosts: number;
}

function ShoppingCart({
    cartItems,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    checkedOutTotal,
    onExtraCostChange,
    extraCosts,
}: ShoppingCartProps) {
    const totalPrice = cartItems.reduce(
        (total, item) => total + item.price * item.cartQuantity,
        0
    );

    // Handle item removal directly without animation
    const handleRemoveItem = (itemId: number) => {
        onRemoveItem(itemId);
    };

    // Don't render if cart is empty and no recent checkout
    return (
        <div className="shopping-cart">
            <div className="shopping-cart-header">
                <h2>Shopping Cart</h2>
                <ShoppingCartIcon />
            </div>
            {checkedOutTotal !== null ? (
                // Display checkout successful summary
                <div className="checked-out-summary">
                    <p>✓ Checkout successful!</p>
                    <div className="total-price">
                        <h3>Final Total: €{checkedOutTotal?.toFixed(2)}</h3>
                    </div>
                    <p>You can pay via the Qrcode and refresh the page to start a new transaction.</p>
                </div>
            ) : (
                // Display current cart state or empty message + extras
                <>
                    {cartItems.length > 0 ? (
                        <ul>
                            {cartItems.map((item) => (
                                <li
                                    key={item.id}
                                >
                                    {item.image && (
                                        <div className="cart-item-image">
                                            <img
                                                src={`${API_BASE_URL}/image-proxy/${item.image}`}
                                                alt={item.name}
                                            />
                                        </div>
                                    )}
                                    <div className="item-details">
                                        <h3>{item.name}</h3>
                                        <p>{item.description}</p>
                                        <p>Quantity: {item.cartQuantity}</p>
                                        <p>Price: €{item.price.toFixed(2)}</p>
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
                                            className="remove-btn icon-button"
                                            onClick={() => handleRemoveItem(item.id)}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Your cart is empty. Scan an item to add it.</p>
                    )}

                    <Extras onExtraCostChange={onExtraCostChange} />

                    {(cartItems.length > 0 || extraCosts > 0) && (
                        <>
                            <div className="total-price">
                                <h3>Total: €{(totalPrice + extraCosts).toFixed(2)}</h3>
                            </div>
                            <button className="checkout-btn" onClick={onCheckout}>
                                Checkout
                            </button>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default ShoppingCart;