import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Alert,
} from '@mui/material';
import { useVolunteer } from './VolunteerContext';

interface VolunteerModalProps {
    open: boolean;
    onClose: () => void;
}

// Password for volunteer mode - you can change this
const VOLUNTEER_PASSWORD = 'volunteer2024';

export default function VolunteerModal({ open, onClose }: VolunteerModalProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setIsVolunteerMode } = useVolunteer();

    const handleSubmit = () => {
        if (password === VOLUNTEER_PASSWORD) {
            setIsVolunteerMode(true);
            setPassword('');
            setError('');
            onClose();
        } else {
            setError('Incorrect password');
            setPassword('');
        }
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        onClose();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Enter Volunteer Mode</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                <Alert severity="info">
                    Volunteer mode allows you to add items to stock instead of removing them.
                </Alert>
                <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoFocus
                    error={!!error}
                    fullWidth
                />
                {error && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Enter
                </Button>
            </DialogActions>
        </Dialog>
    );
}
