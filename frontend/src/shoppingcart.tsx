import { type ItemData, API_BASE_URL } from './sendCodeHandler';
import Extras from './Extras';
import { useToast } from './ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Typography,
  Box,
  InputBase, // For quantity input
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

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
}: ShoppingCartProps) {
    const { addToast } = useToast();
    const totalPrice = cartItems.reduce(
        (total, item) => total + item.price * item.cartQuantity,
        0
    );
    // Handle item removal with animation
    const handleRemoveItem = (itemId: number) => {
        const item = cartItems.find(i => i.id === itemId);
        onRemoveItem(itemId); // Actual removal triggers animation exit
        if (item) {
            addToast(`Removed ${item.name} from cart`, 'info');
        }
    };
    // Don't render if cart is empty and no recent checkout
    return (
        <Card sx={{ maxWidth: 420, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 2, borderTop: isVolunteerMode ? 4 : 0, borderTopColor: isVolunteerMode ? 'info.main' : 'transparent' }}>
            <CardHeader
                title={isVolunteerMode ? "Add to Stock" : "Shopping Cart"}
                avatar={isVolunteerMode ? undefined : <ShoppingCartIcon />}
                titleTypographyProps={{ variant: 'h5', align: 'center' }}
                sx={{ pb: 0, backgroundColor: isVolunteerMode ? 'info.lighter' : 'transparent' }}
            />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0 }}>
                {checkedOutTotal !== null ? (
                    // Display checkout successful summary
                    <Box sx={{ textAlign: 'center', py: 4, animation: 'fadeIn 0.5s ease-in', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6" color="success.main">✓ Checkout successful!</Typography>
                        <Typography variant="h5" fontWeight="bold">Final Total: €{checkedOutTotal?.toFixed(2)}</Typography>
                        <Typography variant="body2">You can pay via the Qrcode and refresh the page to start a new transaction.</Typography>
                    </Box>
                ) : (
                    // Display current cart state or empty message + extras
                    <>
                        {cartItems.length > 0 ? (
                            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
                                <AnimatePresence mode="wait">
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 100, scale: 0.8 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ListItem
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    gap: 2,
                                                    p: 2,
                                                    bgcolor: 'background.default',
                                                    borderRadius: 1,
                                                    border: 1,
                                                    borderColor: 'divider',
                                                    animation: 'bounceIn 0.3s ease-out',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                        {item.image && (
                                            <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 1, flexShrink: 0 }}>
                                                <img
                                                    src={`${API_BASE_URL}/image-proxy/${item.image.startsWith('/') ? item.image.slice(1) : item.image}`}
                                                    alt={item.name}
                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
                                                />
                                            </Box>
                                        )}
                                        <ListItemText
                                            primary={<Typography variant="h6">{item.name}</Typography>}
                                            secondary={
                                                <>
                                                    <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                                                    <Typography variant="body2">Quantity in cart: {item.cartQuantity} / Available in stock: {item.quantity}</Typography>
                                                    <Typography variant="body2">Price: €{item.price.toFixed(2)}</Typography>
                                                </>
                                            }
                                        />
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <IconButton
                                                    onClick={() => onUpdateQuantity(item.id, item.cartQuantity - 1)}
                                                    size="small"
                                                >
                                                    <RemoveIcon />
                                                </IconButton>
                                                <InputBase
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
                                                    inputProps={{ min: 1, max: item.quantity, style: { textAlign: 'center' } }}
                                                    sx={{ width: 45 }}
                                                />
                                                <IconButton
                                                    onClick={() => onUpdateQuantity(item.id, item.cartQuantity + 1)}
                                                    disabled={item.cartQuantity >= item.quantity}
                                                    size="small"
                                                >
                                                    <AddIcon />
                                                </IconButton>
                                            </Box>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleRemoveItem(item.id)}
                                                sx={{ bgcolor: 'error.main', color: 'error.contrastText', '&:hover': { bgcolor: 'error.dark' } }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                        </ListItem>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </List>
                        ) : (
                            <Typography variant="body1" sx={{ textAlign: 'center' }}>Your cart is empty. Scan an item to add it.</Typography>
                        )}

                        <Extras onExtraCostChange={onExtraCostChange} />

                        {(cartItems.length > 0 || extraCosts > 0) && (
                            <Box sx={{ mt: 2 }}>
                                {!isVolunteerMode && (
                                    <Typography variant="h6" sx={{ textAlign: 'right', borderTop: 1, borderColor: 'divider', pt: 2 }}>
                                        Total: €{(totalPrice + extraCosts).toFixed(2)}
                                    </Typography>
                                )}
                                <Button 
                                    variant="contained" 
                                    color={isVolunteerMode ? "info" : "primary"} 
                                    fullWidth 
                                    onClick={onCheckout} 
                                    sx={{ mt: 2 }}
                                >
                                    {isVolunteerMode ? 'Add to Stock' : 'Checkout'}
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );}
export default ShoppingCart;