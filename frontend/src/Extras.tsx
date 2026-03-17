import { useState, useEffect } from 'react';
import { TextField, Typography, Box, Grid } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { EXTRA_SERVICES } from './constants';

interface ExtrasProps {
    onExtraCostChange: (cost: number, breakdown: Record<string, number>) => void;
}

export default function Extras({ onExtraCostChange }: ExtrasProps) {
    // Keep track of quantities for each dynamic service
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    // Calculate individual costs and total
    const serviceCosts = EXTRA_SERVICES.map(service => ({
        ...service,
        cost: (quantities[service.id] || 0) * service.price
    }));
    
    const totalExtraCost = serviceCosts.reduce((sum, s) => sum + s.cost, 0);

    useEffect(() => {
        onExtraCostChange(totalExtraCost, quantities);
    }, [totalExtraCost, quantities, onExtraCostChange]);

    const handleQuantityChange = (id: string, val: string) => {
        const num = Math.max(0, parseFloat(val) || 0);
        setQuantities(prev => ({ ...prev, [id]: num }));
    };

    return (
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'text.secondary', fontWeight: 'bold' }}>
                <SettingsIcon fontSize="small" /> Extra Services (Wiki-Synced)
            </Typography>
            <Grid container spacing={2}>
                {serviceCosts.map((service) => (
                    <Grid item xs={12} key={service.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                label={`${service.name} (${service.unit}) - €${service.price.toFixed(2)}/${service.unit}`}
                                type="number"
                                value={quantities[service.id] || ''}
                                onChange={(e) => handleQuantityChange(service.id, e.target.value)}
                                fullWidth
                                size="small"
                                placeholder="0"
                            />
                            <Typography variant="body2" sx={{ ml: 2, minWidth: '60px', textAlign: 'right' }}>
                                €{service.cost.toFixed(2)}
                            </Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
            {totalExtraCost > 0 && (
                <Typography variant="subtitle2" align="right" sx={{ mt: 2, fontWeight: 'bold', color: 'primary.main' }}>
                    Total Extra Services: €{totalExtraCost.toFixed(2)}
                </Typography>
            )}
        </Box>
    );
}
