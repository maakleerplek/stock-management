import { useState, useEffect } from 'react';
import { type ItemData } from './sendCodeHandler';
import Extras from './Extras';
import ImageDisplay from './ImageDisplay';
import { useToast } from './ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Card,
    CardHeader,
    CardContent,
    List,
    ListItem,
    IconButton,
    Button,
    Typography,
    Box,
    InputBase, // For quantity input
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CheckCircle from '@mui/icons-material/CheckCircle';


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
    isVolunteerMode: boolean;
    isSetMode?: boolean;
    onSetModeChange?: (isSet: boolean) => void;
    isCheckingOut?: boolean;
}



function ShoppingCart({
    cartItems,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    checkedOutTotal,
    onExtraCostChange,
    extraCosts,
    isVolunteerMode,
    isSetMode = false,
    onSetModeChange,
    isCheckingOut = false,
}: ShoppingCartProps) {
    const { addToast } = useToast();
    const [lastActionId, setLastActionId] = useState<number | null>(null);

    const totalPrice = cartItems.reduce(
        (total, item) => total + item.price * item.cartQuantity,
        0
    );

    // Track last item that was updated to trigger a visual flash
    useEffect(() => {
        if (cartItems.length > 0) {
            // Find most recently updated (this is a bit heuristic, but works if we assume the last scanned is added last)
            // Better: rely on external trigger or track quantity changes.
        }
    }, [cartItems]);

    const handleUpdateQuantityWithFeedback = (id: number, qty: number) => {
        if ('vibrate' in navigator) navigator.vibrate(10);
        setLastActionId(id);
        onUpdateQuantity(id, qty);
        setTimeout(() => setLastActionId(null), 500);
    };

    // Handle item removal with animation
    const handleRemoveItem = (itemId: number) => {
        const item = cartItems.find(i => i.id === itemId);
        if ('vibrate' in navigator) navigator.vibrate([30, 30]);
        onRemoveItem(itemId); // Actual removal triggers animation exit
        if (item) {
            addToast(`Removed ${item.name} from cart`, 'info');
        }
    };
    // Don't render if cart is empty and no recent checkout
    return (
        <Card sx={{
            maxWidth: 640,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderTop: isVolunteerMode ? 4 : 0,
            borderTopColor: isVolunteerMode ? 'info.main' : 'transparent',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            borderRadius: 3
        }}>
            <CardHeader
                title={isVolunteerMode ? (isSetMode ? "Set Stock" : "Add to Stock") : "Shopping Cart"}
                avatar={isVolunteerMode ? <VolunteerActivismIcon /> : <ShoppingCartIcon />}
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }}
            />            {isVolunteerMode && onSetModeChange && (
                <Box sx={{ px: 2, pb: 2 }}>
                    <ToggleButtonGroup
                        color="info"
                        value={isSetMode ? 'set' : 'add'}
                        exclusive
                        onChange={(_e, newValue) => {
                            if (newValue !== null) {
                                if ('vibrate' in navigator) navigator.vibrate(20);
                                onSetModeChange(newValue === 'set');
                            }
                        }}
                        aria-label="Stock modification mode"
                        size="small"
                        sx={{ width: '100%' }}
                    >
                        <ToggleButton value="add" sx={{ flex: 1, textTransform: 'none', fontWeight: 'bold' }}>Add / Remove</ToggleButton>
                        <ToggleButton value="set" sx={{ flex: 1, textTransform: 'none', fontWeight: 'bold' }}>Set Absolute</ToggleButton>
                    </ToggleButtonGroup>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                        {isSetMode ? "Directly set the exact stock count." : "Go negative to remove stock."}
                    </Typography>
                </Box>
            )}            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0, p: 0, '&:last-child': { pb: 0 } }}>
                {checkedOutTotal !== null ? (
                    // Display checkout successful summary
                    <Box sx={{ textAlign: 'center', py: 6, px: 3, animation: 'fadeIn 0.5s ease-in', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ color: 'success.main', mb: 1 }}>
                            <CheckCircle sx={{ fontSize: '4rem' }} />
                        </Box>
                        <Typography variant="h5" fontWeight="bold">Done!</Typography>
                        <Typography variant="subtitle1">Total: €{checkedOutTotal?.toFixed(2)}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            You can pay via the QR code below.<br/>
                            Refresh the page to start over.
                        </Typography>
                    </Box>
                ) : (
                    // Display current cart state or empty message + extras
                    <>
                        {cartItems.length > 0 ? (
                            <List sx={{ p: 0 }}>
                                <AnimatePresence mode="popLayout">
                                    {cartItems.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ 
                                                opacity: 1, 
                                                scale: 1,
                                                backgroundColor: lastActionId === item.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent'
                                            }}
                                            exit={{ 
                                                opacity: 0, 
                                                x: 100, 
                                                scale: 0.9,
                                                transition: { duration: 0.2 } 
                                            }}
                                            transition={{ 
                                                type: 'spring',
                                                stiffness: 500,
                                                damping: 30,
                                                mass: 1
                                            }}
                                        >
                                            <ListItem
                                                divider={index !== cartItems.length - 1}
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    py: 1.5,
                                                    px: 2,
                                                    gap: 2,
                                                    transition: 'background-color 0.3s ease'
                                                }}
                                            >
                                                {/* Left Section: Image */}
                                                <Box sx={{ flexShrink: 0 }}>
                                                    <ImageDisplay
                                                        imagePath={item.image}
                                                        alt={item.name}
                                                        width={50}
                                                        height={50}
                                                        sx={{ border: 'none', bgcolor: 'transparent' }}
                                                    />
                                                </Box>

                                                {/* Middle Section: Info */}
                                                <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                                        {item.name}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            <strong>Category:</strong> {item.category}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            <strong>Location:</strong> {item.location}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            <strong>Stock:</strong> {item.quantity} {isVolunteerMode && (
                                                                <Typography component="span" variant="caption" color={isSetMode ? 'warning.main' : (item.cartQuantity >= 0 ? 'success.main' : 'error.main')}>
                                                                    ({isSetMode ? '=>' : (item.cartQuantity >= 0 ? '+' : '-')}{Math.abs(item.cartQuantity)})
                                                                </Typography>
                                                            )}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {/* Right Section: Controls and Price */}
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    gap: 1.5
                                                }}>
                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        bgcolor: 'action.hover', 
                                                        borderRadius: 10, // Pill shape
                                                        overflow: 'hidden', 
                                                        height: 32,
                                                        px: 0.5
                                                    }}>
                                                        <IconButton
                                                            onClick={() => handleUpdateQuantityWithFeedback(item.id, item.cartQuantity - 1)}
                                                            disabled={isSetMode && item.cartQuantity <= 0}
                                                            size="small"
                                                            sx={{ color: 'text.secondary' }}
                                                        >
                                                            <RemoveIcon fontSize="small" />
                                                        </IconButton>
                                                        <InputBase
                                                            value={item.cartQuantity}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value, 10);
                                                                handleUpdateQuantityWithFeedback(
                                                                    item.id,
                                                                    isNaN(val) ? 0 : Math.min(
                                                                        val,
                                                                        isSetMode ? 999999 : (isVolunteerMode ? 999999 : item.quantity)
                                                                    )
                                                                );
                                                            }}
                                                            inputProps={{
                                                                style: { 
                                                                    textAlign: 'center', 
                                                                    padding: 0, 
                                                                    fontSize: '0.9rem', 
                                                                    fontWeight: 'bold', 
                                                                    width: 35
                                                                }
                                                            }}
                                                        />
                                                        <IconButton
                                                            onClick={() => handleUpdateQuantityWithFeedback(item.id, item.cartQuantity + 1)}
                                                            disabled={!isVolunteerMode && !isSetMode && item.cartQuantity >= item.quantity}
                                                            size="small"
                                                            sx={{ color: 'text.secondary' }}
                                                        >
                                                            <AddIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>

                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 60, textAlign: 'right' }}>
                                                        €{(item.price * item.cartQuantity).toFixed(2)}
                                                    </Typography>

                                                    <IconButton
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        size="small"
                                                        color="error"
                                                        sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </ListItem>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </List>
                        ) : (
                            <Typography variant="body2" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                                Your cart is empty. Scan an item to add it.
                            </Typography>
                        )}

                        <Box sx={{ px: 2, pb: 2 }}>
                            {!isVolunteerMode && <Extras onExtraCostChange={onExtraCostChange} />}

                            {(cartItems.length > 0 || extraCosts > 0) && (
                                <Box sx={{ mt: 2 }}>
                                    {!isVolunteerMode && (
                                        <Typography variant="subtitle1" sx={{ textAlign: 'right', borderTop: '1px solid', borderColor: 'divider', pt: 1.5, fontWeight: 'bold' }}>
                                            Total: €{(totalPrice + extraCosts).toFixed(2)}
                                        </Typography>
                                    )}
                                    <Button
                                        variant="contained"
                                        color={isVolunteerMode ? "info" : "primary"}
                                        fullWidth
                                        size="large"
                                        onClick={() => {
                                            if ('vibrate' in navigator) navigator.vibrate(50);
                                            onCheckout();
                                        }}
                                        disabled={isCheckingOut}
                                        startIcon={isCheckingOut ? <CircularProgress size={20} color="inherit" /> : null}
                                        sx={{ 
                                            mt: 2, 
                                            borderRadius: 3, 
                                            textTransform: 'none', 
                                            fontWeight: 'bold', 
                                            py: 1.5,
                                            fontSize: '1.1rem',
                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
                                        }}
                                    >
                                        {isCheckingOut ? 'Processing...' : (isVolunteerMode ? (isSetMode ? 'Set Stock' : 'Add to Stock') : 'Checkout')}
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
export default ShoppingCart;