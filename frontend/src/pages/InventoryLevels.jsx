import { Typography, Box, Card, CardContent, Grid, LinearProgress, Button, Chip, IconButton, CircularProgress } from '@mui/material';
import { AddShoppingCart, WarningAmber, MoreVert } from '@mui/icons-material';
import { useGetInventoryQuery, useAddInventoryMutation } from '../store/apiSlice';
import InventoryForm from '../components/forms/InventoryForm';
import { useState } from 'react';

export default function InventoryLevels() {
  const { data: inventory, isLoading, error } = useGetInventoryQuery();
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
        {inventory && inventory.map((item, idx) => {
          const { status, color } = getStatusInfo(item.inventory_level);
          const capacity = 1000; // Mocked capacity
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
