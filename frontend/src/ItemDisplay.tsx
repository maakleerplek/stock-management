import React from 'react';
import type { ItemData } from './sendCodeHandler';
import './ItemDisplay.css';

interface ItemDisplayProps {
    item: ItemData | null;
}

const ItemDisplay: React.FC<ItemDisplayProps> = ({ item }) => {
    if (!item) {
        return (
            <div className="item-display-container">
                <p>Scan a barcode to see item details.</p>
            </div>
        );
    }

    return (
        <div className="item-display-container">
            <h2>{item.name}</h2>
            {item.image && <img src={item.image} alt={item.name} className="item-image" />}
            <ul className="item-details-list">
                <li><strong>ID:</strong> {item.id}</li>
                <li><strong>Quantity:</strong> {item.quantity}</li>
                <li><strong>Price:</strong> ${item.price}</li>
                <li><strong>Description:</strong> {item.description}</li>
                <li><strong>Serial:</strong> {item.serial || 'N/A'}</li>
                <li><strong>Location:</strong> {item.location || 'N/A'}</li>
                <li><strong>Status:</strong> {item.status}</li>
            </ul>
        </div>
    );
};

export default ItemDisplay;