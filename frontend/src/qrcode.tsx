import { motion } from 'framer-motion';
import { Card, Typography, Box, Button, IconButton, Tooltip } from '@mui/material';
import { Payment, ContentCopy, CheckCircle } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo, useState } from 'react';
import { PAYMENT } from './constants';

interface WeroQrCodeProps {
    total?: number; // Total amount in euros
    description?: string;
}

function WeroQrCode({ total = 0, description = 'Stock Purchase' }: WeroQrCodeProps) {
    const [copied, setCopied] = useState(false);

    const epcQrString = useMemo(() => {
        if (total <= 0) return '';
        const beneficiaryName = PAYMENT.BENEFICIARY_NAME;
        const iban = PAYMENT.IBAN;
        const cleanIban = iban.replace(/\s+/g, '');
        const formattedAmount = `EUR${total.toFixed(2)}`;
        const cleanDescription = description.substring(0, 140);

        const parts = [
            'BCD', '002', '1', 'SCT', '', 
            beneficiaryName, cleanIban, formattedAmount, 
            '', '', cleanDescription, ''
        ];
        return parts.join('\n');
    }, [total, description]);

    const paytoUri = useMemo(() => {
        if (total <= 0) return '';
        const beneficiaryName = PAYMENT.BENEFICIARY_NAME;
        const cleanIban = PAYMENT.IBAN.replace(/\s+/g, '');
        const formattedAmount = total.toFixed(2);
        const cleanDescription = description.substring(0, 140);
        // Standard RFC 8905: payto:iban/<IBAN>?amount=EUR:<AMOUNT>&receiver-name=<NAME>&message=<MESSAGE>
        return `payto:iban/${cleanIban}?amount=EUR:${formattedAmount}&receiver-name=${encodeURIComponent(beneficiaryName)}&message=${encodeURIComponent(cleanDescription)}`;
    }, [total, description]);

    const handlePayNow = () => {
        console.log('[Payment] Payment details:', {
            total: displayTotal,
            beneficiary: PAYMENT.BENEFICIARY_NAME,
            iban: PAYMENT.IBAN,
            uri: paytoUri
        });
        
        console.log('[Payment] Attempting bank app redirect...');
        
        // Use assign for more standard behavior
        try {
            window.location.assign(paytoUri);
        } catch (err) {
            console.error('[Payment] Redirect failed:', err);
            // Fallback
            window.location.href = paytoUri;
        }
    };

    const handleCopyIban = () => {
        const cleanIban = PAYMENT.IBAN.replace(/\s+/g, '');
        navigator.clipboard.writeText(cleanIban);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayTotal = total > 0 ? `€${total.toFixed(2)}` : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <Card sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 3, textAlign: 'center', width: '100%', maxWidth: 400 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Payment sx={{ fontSize: '1.8rem', color: 'secondary.main' }} />
                    <Typography variant="h5" component="h2" fontWeight="bold">Checkout</Typography>
                </Box>
                
                {total > 0 && (
                    <Typography variant="h4" color="primary.main" fontWeight="bold">
                        {displayTotal}
                    </Typography>
                )}

                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '28ch', mb: 1 }}>
                    Scan the code below with your bank app or click the button to pay directly.
                </Typography>

                {total > 0 && (
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: 'white',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            mb: 1
                        }}
                    >
                        <QRCodeSVG
                            value={epcQrString}
                            size={180}
                            level="M"
                            includeMargin={false}
                        />
                    </Box>
                )}

                <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    size="large"
                    onClick={handlePayNow}
                    startIcon={<Payment />}
                    sx={{ borderRadius: 3, py: 1.5, fontWeight: 'bold', textTransform: 'none', fontSize: '1.1rem' }}
                >
                    Open Bank App
                </Button>

                <Box sx={{ mt: 1, width: '100%' }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        If the button doesn't work, copy the IBAN:
                    </Typography>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: 1, 
                        bgcolor: 'action.hover', 
                        py: 1, 
                        px: 2, 
                        borderRadius: 2,
                        border: '1px dashed',
                        borderColor: 'divider'
                    }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                            {PAYMENT.IBAN}
                        </Typography>
                        <Tooltip title={copied ? "Copied!" : "Copy IBAN"}>
                            <IconButton size="small" onClick={handleCopyIban} color={copied ? "success" : "primary"}>
                                {copied ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Card>
        </motion.div>
    );
}

export default WeroQrCode;