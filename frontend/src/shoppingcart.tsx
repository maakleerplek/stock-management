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
    Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CategoryIcon from '@mui/icons-material/Category';
import LocationOnIcon from '@mui/icons-material/LocationOn';


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
        <Card sx={{
            maxWidth: 800,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            borderTop: isVolunteerMode ? 4 : 0,
            borderTopColor: isVolunteerMode ? 'info.main' : 'transparent'
        }}>
            <CardHeader
                title={isVolunteerMode ? (isSetMode ? "Set Stock" : "Add to Stock") : "Shopping Cart"}
                avatar={isVolunteerMode ? <VolunteerActivismIcon /> : <ShoppingCartIcon />}
                titleTypographyProps={{ variant: 'h6' }}
            />            {isVolunteerMode && onSetModeChange && (
                <Box sx={{ px: 2, pb: 2 }}>
                    <ToggleButtonGroup
                        color="info"
                        value={isSetMode ? 'set' : 'add'}
                        exclusive
                        onChange={(_e, newValue) => {
                            if (newValue !== null) {
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
            )}            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 0 }}>
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
                            <List sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: { xs: 1, sm: 1.5 }, flexShrink: 0, p: 0 }}>
                                <AnimatePresence mode="wait">
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 100, scale: 0.8 }}
                                            transition={{ duration: 0.3 }}
                                            style={{ display: 'flex', height: '100%' }}
                                        >
                                            <ListItem
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    p: 2,
                                                    gap: 1.5,
                                                    bgcolor: 'background.paper',
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                                    animation: 'bounceIn 0.3s ease-out',
                                                    overflow: 'hidden',
                                                    height: '100%',
                                                }}
                                            >
                                                {/* Top Row: Image & Info */}
                                                <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                                                    {/* Item Image */}
                                                    <Box sx={{ flexShrink: 0 }}>
                                                        <ImageDisplay
                                                            imagePath={item.image}
                                                            alt={item.name}
                                                            width={80}
                                                            height={80}
                                                        />
                                                    </Box>

                                                    {/* Info */}
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1, gap: 0.5 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {item.name}
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight="bold" color="primary.main" sx={{ ml: 1 }}>
                                                                €{item.price.toFixed(2)}
                                                            </Typography>
                                                        </Box>

                                                        {item.ipn && <Typography variant="caption" color="primary.main" fontWeight="bold" sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', px: 0.8, py: 0.2, borderRadius: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.ipn}</Typography>}

                                                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mt: 0.5, lineHeight: 1.3 }}>
                                                            {item.description || 'No description provided.'}
                                                        </Typography>

                                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                                            {item.category && <Chip size="small" label={item.category} icon={<CategoryIcon sx={{ fontSize: '1rem!important' }} />} sx={{ height: 22, fontSize: '0.75rem', bgcolor: 'action.hover' }} />}
                                                            {item.location && <Chip size="small" label={item.location} icon={<LocationOnIcon sx={{ fontSize: '1rem!important' }} />} sx={{ height: 22, fontSize: '0.75rem', bgcolor: 'action.hover' }} />}
                                                        </Box>
                                                    </Box>
                                                </Box>

                                                {/* Bottom Row: Actions & Stock */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                            Available Stock
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{ textDecoration: isSetMode ? 'line-through' : 'none' }}
                                                            >
                                                                {item.quantity}
                                                            </Typography>
                                                            <Typography
                                                                color={
                                                                    isVolunteerMode
                                                                        ? (isSetMode ? 'warning.main' : (item.cartQuantity >= 0 ? 'success.main' : 'error.main'))
                                                                        : 'error.main'
                                                                }
                                                                sx={{ display: 'flex', alignItems: 'center' }}
                                                            >
                                                                {isVolunteerMode ? (isSetMode ? '=> ' : (item.cartQuantity >= 0 ? '+' : '-')) : '-'}
                                                                {Math.abs(item.cartQuantity)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                        <IconButton
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            size="small"
                                                            color="error"
                                                            sx={{ bgcolor: 'error.main', color: 'error.contrastText', '&:hover': { bgcolor: 'error.dark' }, width: 36, height: 36 }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>

                                                        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                                                            <IconButton
                                                                onClick={() => onUpdateQuantity(item.id, item.cartQuantity - 1)}
                                                                disabled={isSetMode && item.cartQuantity <= 0}
                                                                size="small"
                                                                sx={{ borderRadius: 0, px: 1.5, py: 1, '&:hover': { bgcolor: 'action.hover' } }}
                                                            >
                                                                <RemoveIcon fontSize="small" />
                                                            </IconButton>
                                                            <InputBase
                                                                type="number"
                                                                value={item.cartQuantity}
                                                                onChange={(e) =>
                                                                    onUpdateQuantity(
                                                                        item.id,
                                                                        Math.min(
                                                                            parseInt(e.target.value, 10) || 0,
                                                                            isSetMode ? 999999 : (isVolunteerMode ? 999999 : item.quantity)
                                                                        )
                                                                    )
                                                                }
                                                                inputProps={{
                                                                    min: (isVolunteerMode && !isSetMode) ? undefined : (isSetMode ? 0 : 1),
                                                                    max: (isSetMode || isVolunteerMode) ? undefined : item.quantity,
                                                                    style: { textAlign: 'center', padding: '8px 0', fontSize: '1rem', fontWeight: 'bold' }
                                                                }}
                                                                sx={{ width: 44, borderLeft: '1px solid', borderRight: '1px solid', borderColor: 'divider' }}
                                                            />
                                                            <IconButton
                                                                onClick={() => onUpdateQuantity(item.id, item.cartQuantity + 1)}
                                                                disabled={!isVolunteerMode && !isSetMode && item.cartQuantity >= item.quantity}
                                                                size="small"
                                                                sx={{ borderRadius: 0, px: 1.5, py: 1, '&:hover': { bgcolor: 'action.hover' } }}
                                                            >
                                                                <AddIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </ListItem>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </List>
                        ) : (
                            <Typography variant="body1" sx={{ textAlign: 'center' }}>Your cart is empty. Scan an item to add it.</Typography>
                        )}

                        {!isVolunteerMode && <Extras onExtraCostChange={onExtraCostChange} />}

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
                                    {isVolunteerMode ? (isSetMode ? 'Set Stock' : 'Add to Stock') : 'Checkout'}
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
export default ShoppingCart;