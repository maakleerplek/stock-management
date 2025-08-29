import React, { useState, useEffect } from 'react';
import type { ItemData } from './sendCodeHandler';
import './ItemDisplay.css';

interface ItemDisplayProps {
    item: ItemData | null;
    addLog: (log: string) => void;
    onItemRemoved: () => void; // Add the new prop
}


const ItemDisplay: React.FC<ItemDisplayProps> = ({ item, addLog, onItemRemoved }) => { // Destructure the new prop
    const [takeQuantity, setTakeQuantity] = useState(1);

    useEffect(() => {
        setTakeQuantity(1);
    }, [item]);

    const handleRemove = async () => {
        if (!item) {
            addLog("Remove: No item selected to remove.");
            return;
        }

        const url = `${import.meta.env.VITE_BACKEND_URL}/take-item`;
        const payload = {
            itemId: item.id,
            quantity: takeQuantity,
            notes: "Removed via API"
        };

        addLog(`Remove: Sending POST to ${url} with body: ${JSON.stringify(payload)}`);

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const responseBody = await response.text();

            addLog(`Remove: Response from server (${response.status}): ${responseBody}`);

            if (response.ok) {
                // If the API call was successful, call the callback to reset the display
                onItemRemoved();
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addLog(`Remove: Network or other error - ${errorMessage}`);
        }
    };

    if (!item) {
        return (
            <div className="item-display-container">
                <p>Scan a barcode to see item details.</p>
            </div>
        );
    }

    const handleIncrement = () => {
        if (takeQuantity < item.quantity) {
            setTakeQuantity(prev => prev + 1);
        }
    };

    const handleDecrement = () => {
        if (takeQuantity > 1) {
            setTakeQuantity(prev => prev - 1);
        }
    };

    const totalPrice = (item.price * takeQuantity).toFixed(2);

    return (
        <div className="item-display-container">
            <h2>{item.name}</h2>
           <img src={`${import.meta.env.VITE_BACKEND_URL}/api/proxy${item.thumbnail}`} alt={item.name} className="item-image" />
            <ul className="item-details-list">
                <li><strong>ID:</strong> {item.id}</li>
                <li><strong>Available Quantity:</strong> {item.quantity}</li>
                <li><strong>Price per item:</strong> €{item.price.toFixed(2)}</li>
                <li><strong>Description:</strong> {item.description}</li>
                <li><strong>Status:</strong> {item.status}</li>
            </ul>
            <div className="quantity-selector">
                <div className="counter">
                    <button onClick={handleDecrement} disabled={takeQuantity <= 1}>-</button>
                    <span>{takeQuantity}</span>
                    <button onClick={handleIncrement} disabled={takeQuantity >= item.quantity}>+</button>
                </div>
                <h3>Total Price: ${totalPrice}</h3>
                <button onClick={handleRemove}>Remove Item</button>
            </div>
        </div>
    );
};

export default ItemDisplay;
