import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, TextField, Typography, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings'; // Replaced GearIcon with MUI SettingsIcon

interface ExtrasProps {
    onExtraCostChange: (cost: number) => void;
}

export default function Extras({ onExtraCostChange }: ExtrasProps) {
    const [lasertimeMinutes, setLasertimeMinutes] = useState(0);
    const [printingGrams, setPrintingGrams] = useState(0);

    const lasertimeCost = lasertimeMinutes * 0.50
    const printingCost = printingGrams * 0.10
    const totalExtraCost = lasertimeCost + printingCost;

    useEffect(() => {
        onExtraCostChange(totalExtraCost);
    }, [lasertimeMinutes, printingGrams, onExtraCostChange, totalExtraCost]);

    return (
        <Card sx={{ mt: 2 }}>
            <CardHeader
                title="Extra Services"
                avatar={<SettingsIcon />}
                titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                        label="Lasertime (minutes)"
                        type="number"
                        value={lasertimeMinutes}
                        onChange={(e) => setLasertimeMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                        fullWidth
                        inputProps={{ min: "0" }}
                    />
                    <Typography variant="body1" sx={{ ml: 2 }}>€{lasertimeCost.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                        label="3D Printing (grams)"
                        type="number"
                        value={printingGrams}
                        onChange={(e) => setPrintingGrams(Math.max(0, parseFloat(e.target.value) || 0))}
                        fullWidth
                        inputProps={{ min: "0", step: "1" }}
                    />
                    <Typography variant="body1" sx={{ ml: 2 }}>€{printingCost.toFixed(2)}</Typography>
                </Box>
                <Typography variant="h6" align="right" sx={{ mt: 2 }}>
                    Total Extra Services: €{totalExtraCost.toFixed(2)}
                </Typography>
            </CardContent>
        </Card>
    );
}
