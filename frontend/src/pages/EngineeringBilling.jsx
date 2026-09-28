import { useState } from 'react';
import { Typography, Box, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Stepper, Step, StepLabel, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { AccountTree, Receipt, Schema, AssignmentTurnedIn, AutoFixHigh, Edit } from '@mui/icons-material';
import { useGetBOMsQuery, useGetInvoicesQuery, useGetWorkflowsQuery, useUpdateWorkflowMutation, useGenerateAIBOMMutation } from '../store/apiSlice';

export default function EngineeringBilling() {
  const { data: boms = [] } = useGetBOMsQuery();
  const { data: invoices = [] } = useGetInvoicesQuery();
  const { data: workflows = [] } = useGetWorkflowsQuery();
  const [updateWorkflow] = useUpdateWorkflowMutation();
  const [generateAIBOM, { isLoading: isGenerating }] = useGenerateAIBOMMutation();

  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [productName, setProductName] = useState('');
  
  const [workflowEditOpen, setWorkflowEditOpen] = useState(false);
  const [workflowStages, setWorkflowStages] = useState('');

  const currentStages = workflows.length > 0 ? JSON.parse(workflows[0].stages) : [];

  const handleGenerateBoM = async () => {
    if (!productName) return;
    try {
      await generateAIBOM({ product_name: productName }).unwrap();
      setAiPromptOpen(false);
      setProductName('');
    } catch (e) {
      alert("Failed to generate BoM via YUZU.");
    }
  };

  const handleUpdateWorkflow = async () => {
    const newStages = workflowStages.split(',').map(s => s.trim()).filter(s => s);
    await updateWorkflow({ stages: newStages });
    setWorkflowEditOpen(false);
  };

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schema color="secondary" /> Custom Manufacturing Routing Stages
            </Typography>
            <Button size="small" variant="outlined" color="secondary" startIcon={<Edit />} onClick={() => {
              setWorkflowStages(currentStages.join(', '));
              setWorkflowEditOpen(true);
            }}>
              Customize Workflow
            </Button>
          </Box>
          <Stepper activeStep={2} alternativeLabel>
            {currentStages.map((label, index) => (
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
                <Button variant="contained" size="small" color="primary" startIcon={<AutoFixHigh />} onClick={() => setAiPromptOpen(true)}>
                  Generate BoM (YUZU AI)
                </Button>
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

      {/* YUZU AI BoM Dialog */}
      <Dialog open={aiPromptOpen} onClose={() => setAiPromptOpen(false)} PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none' } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Generate Detailed BoM via YUZU</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Enter the name of the product you manufacture. YUZU will instantly map the minutest details (raw materials, components, and estimated cost).
          </Typography>
          <TextField 
            autoFocus 
            fullWidth 
            label="Product Name (e.g. EV Battery Pack, Office Chair)" 
            value={productName} 
            onChange={(e) => setProductName(e.target.value)} 
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAiPromptOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGenerateBoM} 
            disabled={isGenerating || !productName}
            startIcon={isGenerating ? <CircularProgress size={20} /> : <AutoFixHigh />}
          >
            {isGenerating ? 'YUZU is Mapping...' : 'Generate AI BoM'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Custom Workflow Edit Dialog */}
      <Dialog open={workflowEditOpen} onClose={() => setWorkflowEditOpen(false)} PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none', width: '100%', maxWidth: 500 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Customize Routing Stages</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Enter your factory's custom manufacturing stages, separated by commas. 
          </Typography>
          <TextField 
            autoFocus 
            fullWidth 
            multiline
            rows={4}
            label="Stages (Comma separated)" 
            value={workflowStages} 
            onChange={(e) => setWorkflowStages(e.target.value)} 
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setWorkflowEditOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleUpdateWorkflow}>Save Custom Workflow</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
