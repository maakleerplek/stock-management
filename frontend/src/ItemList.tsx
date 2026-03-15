import { useState, useEffect, useMemo } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    TablePagination,
    TextField,
    InputAdornment,
    Chip,
    CircularProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import { 
    Search as SearchIcon, 
    Refresh as RefreshIcon,
    Inventory as InventoryIcon,
    Category as CategoryIcon,
    LocationOn as LocationIcon,
    Euro as EuroIcon
} from '@mui/icons-material';
import { API_CONFIG } from './constants';
import { createApiUrl } from './utils/helpers';
import ImageDisplay from './ImageDisplay';

interface Item {
    id: number;
    name: string;
    category: string;
    location: string;
    quantity: number;
    price: number;
    image: string | null;
    ipn: string;
    description: string;
}

export default function ItemList() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.GET_ALL_ITEMS));
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }
            const data = await response.json();
            if (data.status === 'ok') {
                setItems(data.items);
            } else {
                throw new Error(data.message || 'Unknown error');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const filteredItems = useMemo(() => {
        return items.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.ipn.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [items, searchQuery]);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading && items.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <InventoryIcon color="primary" sx={{ fontSize: '2rem' }} />
                    <Typography variant="h5" fontWeight="bold">Inventory List</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexGrow: 1, maxWidth: { xs: '100%', md: '600px' } }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search by name, category, location or IPN..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Tooltip title="Refresh List">
                        <IconButton onClick={fetchItems} disabled={loading} color="primary">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {error && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Typography>{error}</Typography>
                </Paper>
            )}

            <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                            <TableCell width={80}>Image</TableCell>
                            <TableCell>Name / IPN</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell align="right">Stock</TableCell>
                            <TableCell align="right">Price</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredItems
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((item) => (
                                <TableRow key={item.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <ImageDisplay 
                                            imagePath={item.image} 
                                            alt={item.name} 
                                            width={50} 
                                            height={50} 
                                            sx={{ borderRadius: 1 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">{item.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{item.ipn}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            icon={<CategoryIcon sx={{ fontSize: '0.9rem !important' }} />} 
                                            label={item.category} 
                                            size="small" 
                                            variant="outlined" 
                                            sx={{ fontSize: '0.7rem' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <LocationIcon sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
                                            <Typography variant="caption">{item.location}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography 
                                            variant="body2" 
                                            fontWeight="bold" 
                                            color={item.quantity > 0 ? 'success.main' : 'error.main'}
                                        >
                                            {item.quantity}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25 }}>
                                            <EuroIcon sx={{ fontSize: '0.8rem' }} />
                                            <Typography variant="body2" fontWeight="bold">
                                                {item.price.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        {filteredItems.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                                    <Typography color="text.secondary">No items found matching your search.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={filteredItems.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </Box>
    );
}
