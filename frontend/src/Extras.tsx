import { useState, useEffect } from 'react';
import './Extras.css';
import GearIcon from './assets/Gear.svg?react';

interface ExtrasProps {
    onExtraCostChange: (cost: number) => void;
}

export default function Extras({ onExtraCostChange }: ExtrasProps) {
    const [lasertimeMinutes, setLasertimeMinutes] = useState(0);
    const [printingGrams, setPrintingGrams] = useState(0);

    const lasertimeCost = lasertimeMinutes * 0.50;
    const printingCost = printingGrams * 0.10;
    const totalExtraCost = lasertimeCost + printingCost;

    useEffect(() => {
        onExtraCostChange(totalExtraCost);
    }, [lasertimeMinutes, printingGrams, onExtraCostChange, totalExtraCost]);

    return (
        <div className="extras-container">
            <div className="extras-header">
                <h2>Extra Services</h2>
                <GearIcon />
            </div>
            <div className="extra-item">
                <label htmlFor="lasertime">Lasertime (minutes):</label>
                <input
                    id="lasertime"
                    type="number"
                    value={lasertimeMinutes}
                    onChange={(e) => setLasertimeMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    min="0"
                />
                <span>€{lasertimeCost.toFixed(2)}</span>
            </div>
            <div className="extra-item">
                <label htmlFor="printing">3D Printing (grams):</label>
                <input
                    id="printing"
                    type="number"
                    value={printingGrams}
                    onChange={(e) => setPrintingGrams(Math.max(0, parseFloat(e.target.value) || 0))}
                    min="0"
                    step="0.1"
                />
                <span>€{printingCost.toFixed(2)}</span>
            </div>
            <div className="extra-total">
                <h3>Total Extra Services: €{totalExtraCost.toFixed(2)}</h3>
            </div>
        </div>
    );
}
