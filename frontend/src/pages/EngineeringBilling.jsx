import { Typography, Box, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Stepper, Step, StepLabel } from '@mui/material';
import { AccountTree, Receipt, Schema, AssignmentTurnedIn } from '@mui/icons-material';
import { useGetBOMsQuery, useGetInvoicesQuery } from '../store/apiSlice';

export default function EngineeringBilling() {
  const { data: boms = [] } = useGetBOMsQuery();
  const { data: invoices = [] } = useGetInvoicesQuery();

  const manufacturingStages = [
    'Raw Material Procurement',
    'Milling & Machining (WIP)',
    'Sub-Assembly (WIP)',
    'Quality Inspection',
    'Finished Goods Storage'
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 5, alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>Engineering & Finance</Typography>
          <Typography variant="body1" color="text.secondary">Bill of Materials (BoM), Routing Stages, SoWs, and Invoicing.</Typography>
        </Box>
      </Box>

      {/* Manufacturing Routing Pipeline */}
      <Card sx={{ mb: 4, bgcolor: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schema color="secondary" /> Standard Manufacturing Routing Stages
          </Typography>
          <Stepper activeStep={2} alternativeLabel>
            {manufacturingStages.map((label, index) => (
              <Step key={label}>
                <StepLabel 
                  StepIconProps={{ sx: { color: index <= 2 ? 'secondary.main !important' : 'rgba(255,255,255,0.2) !important' } }}
                >
                  <Typography sx={{ color: index <= 2 ? 'white' : 'text.secondary', fontWeight: index <= 2 ? 'bold' : 'normal' }}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Bill of Materials (BoM) */}
        <Grid item xs={12} lg={6}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(30, 41, 59, 0.8)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountTree color="primary" /> Bill of Materials (BoM)
                </Typography>
                <Button variant="outlined" size="small">Create BoM</Button>
              </Box>
              
              <TableContainer component={Box} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Product</TableCell>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Components Map</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Total Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {boms.map((bom) => (
                      <TableRow key={bom.id} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ color: 'text.primary', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold' }}>{bom.product_name}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          {Object.entries(JSON.parse(bom.components)).map(([key, val]) => (
                            <Chip key={key} label={`${key}: ${val}`} size="small" sx={{ mr: 1, mb: 1, bgcolor: 'rgba(255,255,255,0.05)' }} />
                          ))}
                        </TableCell>
                        <TableCell align="right" sx={{ color: 'primary.light', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold' }}>
                          ${bom.total_cost.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* SoWs and Invoicing */}
        <Grid item xs={12} lg={6}>
          <Card className="hover-lift" sx={{ border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(30, 41, 59, 0.8)', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Receipt color="success" /> SoWs & Client Invoicing
                </Typography>
                <Button variant="contained" color="success" size="small" startIcon={<AssignmentTurnedIn />}>Generate Invoice</Button>
              </Box>

              <TableContainer component={Box} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Client</TableCell>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>SoW Ref</TableCell>
                      <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Amount</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ color: 'text.primary', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 'bold' }}>{inv.client_name}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{inv.sow_reference}</TableCell>
                        <TableCell sx={{ color: 'text.primary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          ${inv.amount.toLocaleString()}
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <Chip label={inv.status} color={inv.status === 'Paid' ? 'success' : 'error'} size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
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
