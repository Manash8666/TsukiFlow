import { Typography, Box, Card, CardContent, Grid, LinearProgress, Button, Chip, IconButton, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { AddShoppingCart, WarningAmber, MoreVert, QrCode } from '@mui/icons-material';
import { useGetInventoryQuery, useAddInventoryMutation, useGetSKUsQuery } from '../store/apiSlice';
import InventoryForm from '../components/forms/InventoryForm';
import { useState } from 'react';

export default function InventoryLevels() {
  const { data: inventory, isLoading, error } = useGetInventoryQuery();
  const { data: skus = [] } = useGetSKUsQuery();
  const [addInventory] = useAddInventoryMutation();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const getStatusInfo = (level) => {
    if (level < 200) return { status: 'Critical', color: '#ef4444' };
    if (level < 400) return { status: 'Low Stock', color: '#f59e0b' };
    return { status: 'Optimal', color: '#10b981' };
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 5, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Inventory Levels</Typography>
          <Typography variant="body1" color="text.secondary">Live sync with backend database.</Typography>
        </Box>
        <Button variant="contained" color="primary" size="large" startIcon={<AddShoppingCart />} onClick={() => setIsFormOpen(true)}>
          Order Stock
        </Button>
      </Box>

      {isLoading && <CircularProgress />}
      {error && <Typography color="error">Error loading inventory data</Typography>}

      <Grid container spacing={3}>
        {inventory && inventory.map((item) => {
          const { status, color } = getStatusInfo(item.inventory_level);
          const capacity = 1000; // Expected max capacity per storage bin
          const percentage = Math.round((item.inventory_level / capacity) * 100);
          
          return (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card className="hover-lift" sx={{ position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: color }} />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h6" fontWeight="600">{item.name}</Typography>
                    <IconButton size="small"><MoreVert /></IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 3 }}>
                    <Typography variant="h3" fontWeight="800" sx={{ color: color }}>{item.inventory_level}</Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 0.5 }}>/ {capacity} units</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip size="small" label={status} sx={{ bgcolor: `${color}22`, color: color, fontWeight: 'bold' }} icon={status !== 'Optimal' ? <WarningAmber fontSize="small" color="inherit"/> : null}/>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>{percentage}% Full</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={percentage} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      bgcolor: 'rgba(255,255,255,0.05)',
                      '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 4 }
                    }} 
                  />
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* SKU & Finished Goods Management */}
      <Box sx={{ mt: 5 }}>
        <Card className="hover-lift" sx={{ border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(30, 41, 59, 0.8)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <QrCode color="secondary" /> SKU & Product Variants Directory
              </Typography>
              <Button variant="outlined" color="secondary" size="small">Add SKU</Button>
            </Box>
            
            <TableContainer component={Box} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>SKU Code</TableCell>
                    <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Product Name</TableCell>
                    <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Variant Details</TableCell>
                    <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Unit Price</TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Finished Goods Stock</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {skus.map((sku) => (
                    <TableRow key={sku.id} sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ color: 'text.primary', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold' }}>
                        <Chip label={sku.sku_code} size="small" variant="outlined" color="secondary" />
                      </TableCell>
                      <TableCell sx={{ color: 'text.primary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{sku.product_name}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{sku.variant}</TableCell>
                      <TableCell sx={{ color: 'primary.light', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        ${sku.unit_price.toFixed(2)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'text.primary', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold' }}>
                        {sku.stock_quantity.toLocaleString()} units
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
      
      <InventoryForm 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSubmit={async (data) => {
          await addInventory(data);
          setIsFormOpen(false);
        }}
      />
    </Box>
  );
}
