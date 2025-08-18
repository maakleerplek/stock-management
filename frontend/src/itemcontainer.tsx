import React from 'react';

interface ItemData {
    name?: string;
    imageUrl?: string;
    description?: string;
    [key: string]: any;
}

interface ItemContainerProps {
    item?: ItemData;
}

const sampleItem: ItemData = {
    name: "Sample item",
    imageUrl: "//fix",
    description: "Dit is een voorbeeld item. Scan een barcode om echte data te zien.",
};

const ItemContainer: React.FC<ItemContainerProps> = ({ item }) => {
    const displayItem = item || sampleItem;

    return (
        <div className="item-container">
            <h3>{displayItem.name || "Unnamed item"}</h3>
            {displayItem.imageUrl && (
                <img
                    src={displayItem.imageUrl}
                    alt={displayItem.name}
                    style={{ maxWidth: "200px", borderRadius: "8px", marginBottom: "1em" }}
                />
            )}
            {displayItem.description && <p>{displayItem.description}</p>}
            <pre style={{ background: "#f7f7f7", padding: "1em", borderRadius: "8px" }}>
                {JSON.stringify(displayItem, null, 2)}
            </pre>
        </div>
    );
};

export default ItemContainer;