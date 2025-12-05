import codeImg from './assets/code_202508181659032.png';
import { motion } from 'framer-motion';
import { Card, Typography, CardMedia, Box } from '@mui/material';
import { Payment } from '@mui/icons-material';

function PayconiqQrCode() {
    const handleClick = () => {
        window.open("https://payconiq.com/merchant/1/616941d236664900073738ce", "_blank");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
        <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, p: 3, textAlign: 'center', width: '100%', maxWidth: 400 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Payment sx={{ fontSize: '1.8rem', color: 'secondary.main' }} />
                <Typography variant="h5" component="h2">Pay with Payconiq</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '25ch' }}>Click the QR code to open the payment link.</Typography>
            <CardMedia
                component="img"
                image={codeImg}
                alt="Payconiqqrcode"
                onClick={handleClick}
                sx={{ width: 150, height: 150, cursor: 'pointer', borderRadius: 1, border: '4px solid', borderColor: 'background.paper', transition: 'transform 0.3s, box-shadow 0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 0 0 4px var(--mui-palette-primary-main)' } }}
            />
        </Card>
        </motion.div>
    );
}

export default PayconiqQrCode;