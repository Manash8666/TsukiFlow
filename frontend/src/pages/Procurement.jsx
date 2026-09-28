import { Typography, Box, Card, CardContent, Grid, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import { Description, LocalShipping, Recycling, PostAdd, ReceiptLong } from '@mui/icons-material';
import { useGetPOsQuery, useGetWasteLogsQuery } from '../store/apiSlice';

export default function ProcurementWaste() {
  const { data: pos = [] } = useGetPOsQuery();
  const { data: waste = [] } = useGetWasteLogsQuery();

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
                          <Button size="small" variant="outlined" color="primary" startIcon={<ReceiptLong />}>Generate GRN</Button>
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
                <Button variant="outlined" color="success" size="small">Log Scrap</Button>
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
    </Box>
  );
}
