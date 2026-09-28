import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid } from '@mui/material';

export default function PlanForm({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    product_id: '',
    quantity: '',
    start_date: '',
    end_date: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      product_id: parseInt(formData.product_id, 10),
      quantity: parseInt(formData.quantity, 10),
      status: 'Planned'
    });
    setFormData({ name: '', product_id: '', quantity: '', start_date: '', end_date: '' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Create Production Plan</DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth required name="name" label="Plan Name" value={formData.name} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required name="product_id" label="Product ID" type="number" value={formData.product_id} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required name="quantity" label="Quantity" type="number" value={formData.quantity} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required name="start_date" label="Start Date" type="date" InputLabelProps={{ shrink: true }} value={formData.start_date} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required name="end_date" label="End Date" type="date" InputLabelProps={{ shrink: true }} value={formData.end_date} onChange={handleChange} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" color="primary">Create Plan</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
