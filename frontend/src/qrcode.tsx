import { motion } from 'framer-motion';
import { Card, Typography, Box } from '@mui/material';
import { Payment } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo } from 'react';
import { PAYMENT } from './constants';

interface PayconiqQrCodeProps {
    total?: number; // Total amount in euros
}

function PayconiqQrCode({ total = 0 }: PayconiqQrCodeProps) {
    // Generate dynamic Payconiq payment link with amount
    // Format: https://payconiq.com/merchant/{merchantId}?amount={amountInCents}
    const MERCHANT_ID = PAYMENT.PAYCONIQ_MERCHANT_ID;

    const paymentLink = useMemo(() => {
        if (total > 0) {
            // Convert euros to cents for Payconiq
            const amountInCents = Math.round(total * 100);
            return `https://payconiq.com/merchant/1/${MERCHANT_ID}?amount=${amountInCents}`;
        }
        // Default link when no total is provided
        return `https://payconiq.com/merchant/1/${MERCHANT_ID}`;
    }, [total]);

    const handleClick = () => {
        window.open(paymentLink, "_blank");
    };

    const displayTotal = total > 0 ? `€${total.toFixed(2)}` : '';

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
                {total > 0 && (
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                        Amount: {displayTotal}
                    </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '25ch' }}>
                    Scan the QR code to pay the exact amount.
                </Typography>
                <Box
                    onClick={handleClick}
                    sx={{
                        cursor: 'pointer',
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1.5,
                        border: '4px solid',
                        borderColor: 'background.paper',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 0 0 4px var(--mui-palette-primary-main)'
                        }
                    }}
                >
                    <QRCodeSVG
                        value={paymentLink}
                        size={150}
                        level="M"
                        includeMargin={false}
                    />
                </Box>
                <Typography variant="caption" color="text.secondary">
                    Click QR code to open payment link
                </Typography>
            </Card>
        </motion.div>
    );
}

export default PayconiqQrCode;