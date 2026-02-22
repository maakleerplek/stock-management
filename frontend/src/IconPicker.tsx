import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import BuildIcon from '@mui/icons-material/Build';
import CableIcon from '@mui/icons-material/Cable';
import BoltIcon from '@mui/icons-material/Bolt';
import DevicesIcon from '@mui/icons-material/Devices';
import ConstructionIcon from '@mui/icons-material/Construction';
import HandymanIcon from '@mui/icons-material/Handyman';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';

export const COMMON_ICONS = [
    { name: 'fas fa-box', label: 'Box', icon: <InventoryIcon fontSize="small" /> },
    { name: 'fas fa-boxes', label: 'Boxes', icon: <CategoryIcon fontSize="small" /> },
    { name: 'fas fa-wrench', label: 'Wrench (Tool)', icon: <BuildIcon fontSize="small" /> },
    { name: 'fas fa-plug', label: 'Plug (Cable)', icon: <CableIcon fontSize="small" /> },
    { name: 'fas fa-bolt', label: 'Bolt (Electrical)', icon: <BoltIcon fontSize="small" /> },
    { name: 'fas fa-microchip', label: 'Microchip (Electronic)', icon: <DevicesIcon fontSize="small" /> },
    { name: 'fas fa-hammer', label: 'Hammer (Hardware)', icon: <ConstructionIcon fontSize="small" /> },
    { name: 'fas fa-screwdriver', label: 'Screwdriver (Tool)', icon: <HandymanIcon fontSize="small" /> },
    { name: 'fas fa-cogs', label: 'Cogs (Mechanical)', icon: <PrecisionManufacturingIcon fontSize="small" /> },
];

interface IconPickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

const IconPicker: React.FC<IconPickerProps> = ({ value, onChange, label = 'Icon' }) => {
    return (
        <FormControl fullWidth>
            <InputLabel>{label}</InputLabel>
            <Select
                value={value}
                onChange={(e) => onChange(e.target.value as string)}
                label={label}
            >
                <MenuItem value="">
                    <em>None</em>
                </MenuItem>
                {COMMON_ICONS.map((iconOption) => (
                    <MenuItem key={iconOption.name} value={iconOption.name}>
                        <ListItemIcon>{iconOption.icon}</ListItemIcon>
                        <ListItemText>{iconOption.label}</ListItemText>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default IconPicker;
