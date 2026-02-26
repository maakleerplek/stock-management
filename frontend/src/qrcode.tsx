import { motion } from 'framer-motion';
import { Card, Typography, Box } from '@mui/material';
import { Payment } from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo } from 'react';
import { PAYMENT } from './constants';

interface WeroQrCodeProps {
    total?: number; // Total amount in euros
    description?: string;
}

function WeroQrCode({ total = 0, description = 'Stock Purchase' }: WeroQrCodeProps) {
    // Generate EPC (European Payments Council) QR code string for SEPA Credit Transfer (used by Wero and standard banking apps)
    // Format:
    // BCD
    // 002
    // 1
    // SCT
    // 
    // Beneficiary Name
    // IBAN
    // EURAmount (e.g., EUR12.50)
    // 
    // 
    // Description (max 140 chars)

    const epcQrString = useMemo(() => {
        if (total <= 0) return '';

        const beneficiaryName = PAYMENT.BENEFICIARY_NAME;
        const iban = PAYMENT.IBAN;

        // Remove spaces from IBAN
        const cleanIban = iban.replace(/\s+/g, '');

        // Amount must be formatted to 2 decimal places, NO trailing zeros if integer, but easiest is just max 2 decimals. 
        // Example EUR12.50 or EUR10
        // Standard says: Format: EUR followed by amount with max 2 decimals separated by dot.
        const formattedAmount = `EUR${total.toFixed(2)}`;

        // Truncate description to 140 characters per EPC standard
        const cleanDescription = description.substring(0, 140);

        // Assemble according to EPC standard (lines separated by \n)
        const parts = [
            'BCD',
            '002',
            '1',
            'SCT',
            '', // BIC (optional)
            beneficiaryName,
            cleanIban,
            formattedAmount,
            '', // Purpose code (optional)
            '', // Remittance Information (Structured) - mutually exclusive with unstructured
            cleanDescription, // Remittance Information (Unstructured)
            ''  // Beneficiary to originator information (optional)
        ];

        return parts.join('\n');
    }, [total, description]);

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
                    <Typography variant="h5" component="h2">Pay via Bank App / Wero</Typography>
                </Box>
                {total > 0 && (
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                        Amount: {displayTotal}
                    </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '25ch' }}>
                    Scan the QR code with your banking app or Wero to pay.
                </Typography>
                {total > 0 && (
                    <Box
                        sx={{
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
                            value={epcQrString}
                            size={150}
                            level="M"
                            includeMargin={false}
                        />
                    </Box>
                )}
                {total > 0 && (
                    <Typography variant="caption" color="text.secondary">
                        Scan the code directly
                    </Typography>
                )}
            </Card>
        </motion.div>
    );
}

export default WeroQrCode;