import { Typography, Box, Card, CardContent, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import { Description, Recycling, PostAdd, ReceiptLong } from '@mui/icons-material';
import { useGetPOsQuery, useGetWasteLogsQuery, useCreateGRNMutation, useCreateWasteMutation } from '../store/apiSlice';
import { useState } from 'react';

export default function ProcurementWaste() {
  const { data: pos = [] } = useGetPOsQuery();
  const { data: waste = [] } = useGetWasteLogsQuery();
  const [createGRN] = useCreateGRNMutation();
  const [createWaste] = useCreateWasteMutation();

  const [grnModalOpen, setGrnModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);
  const [receivedQty, setReceivedQty] = useState('');
  const [grnError, setGrnError] = useState('');

  const [wasteModalOpen, setWasteModalOpen] = useState(false);
  const [wasteMaterial, setWasteMaterial] = useState('');
  const [wasteQty, setWasteQty] = useState('');
  const [wasteMethod, setWasteMethod] = useState('');

  const handleOpenGRN = (po) => {
    setSelectedPO(po);
    setReceivedQty(po.quantity); // default to expected
    setGrnError('');
    setGrnModalOpen(true);
  };

  const handleLogWaste = async () => {
    try {
      await createWaste({
        material: wasteMaterial,
        quantity_kg: parseFloat(wasteQty),
        disposal_method: wasteMethod,
        date_logged: new Date().toISOString().split('T')[0]
      }).unwrap();
      setWasteModalOpen(false);
      setWasteMaterial('');
      setWasteQty('');
      setWasteMethod('');
    } catch (err) {
      console.error(err);
      alert("Failed to log waste.");
    }
  };

  const handleSubmitGRN = async () => {
    const qty = parseInt(receivedQty, 10);
    if (isNaN(qty) || qty <= 0) {
      setGrnError('Invalid quantity');
      return;
    }
    
    // 3-way match tolerance check
    const variance = Math.abs(qty - selectedPO.quantity) / selectedPO.quantity;
    if (variance > 0.1) {
      setGrnError('Quantity variance exceeds 10% tolerance. Requires override.');
      return;
    }

    try {
      await createGRN({
        po_id: selectedPO.id,
        received_quantity: qty,
        status: "QUARANTINE", // Part 2 IQC requirement
        timestamp: new Date().toISOString()
      }).unwrap();
      
      setGrnModalOpen(false);
    } catch (err) {
      console.error(err);
      setGrnError('Failed to create GRN.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 5, alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Procurement & Waste</Typography>
          <Typography variant="body1" color="text.secondary">Manage Purchase Orders (POs), GRNs, and Scrap Tracking.</Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* PO & GRN Section */}
        <Grid item xs={12} lg={7}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(30, 41, 59, 0.8)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Description color="primary" /> Purchase Orders & GRN
                </Typography>
                <Button variant="contained" size="small" startIcon={<PostAdd />}>Create PO</Button>
              </Box>
              
              <TableContainer component={Box} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>PO Number</TableCell>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Vendor</TableCell>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Material</TableCell>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pos.length > 0 ? pos.map((po) => (
                      <TableRow key={po.id} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ color: 'text.primary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{po.po_number}</TableCell>
                        <TableCell sx={{ color: 'text.primary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{po.vendor_name}</TableCell>
                        <TableCell sx={{ color: 'text.primary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{po.material} ({po.quantity})</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Chip label={po.status} color={po.status === 'Issued' ? 'warning' : 'success'} size="small" />
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Button size="small" variant="outlined" color="primary" startIcon={<ReceiptLong />} onClick={() => handleOpenGRN(po)} disabled={po.status === 'GRN Generated'}>Generate GRN</Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={5} align="center" sx={{ color: 'text.secondary', py: 3, border: 0 }}>No active Purchase Orders.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Waste & Scrap Section */}
        <Grid item xs={12} lg={5}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(30, 41, 59, 0.8)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Recycling color="success" /> Waste & Scrap Log
                </Typography>
                <Button variant="outlined" color="success" size="small" onClick={() => setWasteModalOpen(true)}>Log Scrap</Button>
              </Box>

              <TableContainer component={Box} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Material</TableCell>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Qty (KG)</TableCell>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Method</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {waste.length > 0 ? waste.map((w) => (
                      <TableRow key={w.id} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ color: 'text.primary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{w.material}</TableCell>
                        <TableCell sx={{ color: 'text.primary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{w.quantity_kg}</TableCell>
                        <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Chip label={w.disposal_method} color={w.disposal_method === 'Sold as Scrap' ? 'success' : 'default'} size="small" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={3} align="center" sx={{ color: 'text.secondary', py: 3, border: 0 }}>No waste logged recently.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* GRN Generation Modal */}
      <Dialog open={grnModalOpen} onClose={() => setGrnModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 3 } }}>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Generate Goods Receipt Note (GRN)</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {grnError && <Alert severity="error" sx={{ mb: 2 }}>{grnError}</Alert>}
          {selectedPO && (
            <>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                PO: {selectedPO.po_number} | Vendor: {selectedPO.vendor_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Material: {selectedPO.material} (Expected: {selectedPO.quantity})
              </Typography>
              
              <TextField
                fullWidth
                type="number"
                label="Received Quantity"
                value={receivedQty}
                onChange={(e) => setReceivedQty(e.target.value)}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Received goods will be placed in QUARANTINE until IQC (Incoming Quality Control) release.
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={() => setGrnModalOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSubmitGRN} variant="contained" color="primary">Receive to Quarantine</Button>
        </DialogActions>
      </Dialog>

      {/* Log Waste Modal */}
      <Dialog open={wasteModalOpen} onClose={() => setWasteModalOpen(false)} PaperProps={{ sx: { bgcolor: '#1e293b', color: '#e2e8f0', minWidth: 400 } }}>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: '#0f172a' }}>
          Log Scrap / Waste
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField 
            fullWidth 
            label="Material Name" 
            variant="outlined" 
            sx={{ mb: 2, mt: 1, input: { color: '#e2e8f0' }, label: { color: 'text.secondary' } }}
            value={wasteMaterial}
            onChange={(e) => setWasteMaterial(e.target.value)}
          />
          <TextField 
            fullWidth 
            label="Quantity (KG)" 
            type="number"
            variant="outlined" 
            sx={{ mb: 2, input: { color: '#e2e8f0' }, label: { color: 'text.secondary' } }}
            value={wasteQty}
            onChange={(e) => setWasteQty(e.target.value)}
          />
          <TextField 
            fullWidth 
            label="Disposal Method (e.g., Recycled, Sold as Scrap)" 
            variant="outlined" 
            sx={{ mb: 2, input: { color: '#e2e8f0' }, label: { color: 'text.secondary' } }}
            value={wasteMethod}
            onChange={(e) => setWasteMethod(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#0f172a' }}>
          <Button onClick={() => setWasteModalOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleLogWaste}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
