import { useState } from 'react';
import { Typography, Box, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, Stepper, Step, StepLabel, TextField, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { AccountTree, Receipt, Schema, AssignmentTurnedIn, AutoFixHigh, Edit, AddBox, KeyboardArrowRight } from '@mui/icons-material';
import { useGetInvoicesQuery, useGetWorkflowsQuery, useUpdateWorkflowMutation, useGenerateAIBOMMutation, useCreateManualBOMMutation, useGetMultiLevelBOMsQuery } from '../store/apiSlice';

export default function EngineeringBilling() {
  const { data: mlBoms = [] } = useGetMultiLevelBOMsQuery();
  const { data: invoices = [] } = useGetInvoicesQuery();
  const { data: workflows = [] } = useGetWorkflowsQuery();
  const [updateWorkflow] = useUpdateWorkflowMutation();
  const [generateAIBOM, { isLoading: isGenerating }] = useGenerateAIBOMMutation();
  const [createManualBOM] = useCreateManualBOMMutation();

  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [productName, setProductName] = useState('');
  
  const [manualBOMOpen, setManualBOMOpen] = useState(false);
  const [manualProduct, setManualProduct] = useState('');
  const [manualComponents, setManualComponents] = useState('{"Fabric (m)": 2, "Buttons": 5}');
  const [manualCost, setManualCost] = useState('');

  const [workflowEditOpen, setWorkflowEditOpen] = useState(false);
  const [workflowStages, setWorkflowStages] = useState('');

  const currentStages = workflows.length > 0 ? JSON.parse(workflows[0].stages) : [];

  const handleGenerateBoM = async () => {
    if (!productName) return;
    try {
      await generateAIBOM({ product_name: productName }).unwrap();
      setAiPromptOpen(false);
      setProductName('');
    } catch (err) {
      console.error(err);
      alert("Failed to generate BoM via YUZU.");
    }
  };

  const handleManualBoM = async () => {
    try {
      await createManualBOM({ 
        product_name: manualProduct, 
        components: manualComponents, 
        total_cost: parseFloat(manualCost) || 0 
      }).unwrap();
      setManualBOMOpen(false);
      setManualProduct('');
    } catch (err) {
      console.error(err);
      alert("Failed to save Manual BoM. Check JSON formatting.");
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
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small" color="primary" startIcon={<AddBox />} onClick={() => setManualBOMOpen(true)}>
                    Manual Entry
                  </Button>
                  <Button variant="contained" size="small" color="primary" startIcon={<AutoFixHigh />} onClick={() => setAiPromptOpen(true)}>
                    YUZU AI
                  </Button>
                </Box>
              </Box>
              <Box sx={{ mt: 2 }}>
                {mlBoms.map((parent) => (
                  <Box key={parent.parent_product_id} sx={{ mb: 3, p: 2, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary.light" gutterBottom>
                      {parent.parent_product_name}
                    </Typography>
                    <Box sx={{ pl: 3, borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                      {parent.children.map(child => (
                        <Box key={child.child_id} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <KeyboardArrowRight fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                          <Typography variant="body2" sx={{ flexGrow: 1 }}>{child.child_name}</Typography>
                          <Chip label={`Qty: ${child.quantity_required}`} size="small" variant="outlined" sx={{ mr: 1 }} />
                          <Chip label={`Stage: ${child.stage}`} size="small" color="secondary" />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
                {mlBoms.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                    No multi-level BoMs configured.
                  </Typography>
                )}
              </Box>
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

      {/* Manual BoM Dialog */}
      <Dialog open={manualBOMOpen} onClose={() => setManualBOMOpen(false)} PaperProps={{ sx: { bgcolor: 'background.paper', backgroundImage: 'none', width: '100%', maxWidth: 500 } }}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Manual BoM Entry</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Upload or define your proprietary Bill of Materials.
          </Typography>
          <TextField fullWidth label="Product Name" sx={{ mb: 2, mt: 1 }} value={manualProduct} onChange={(e) => setManualProduct(e.target.value)} />
          <TextField fullWidth multiline rows={3} label="Components (JSON format)" sx={{ mb: 2 }} value={manualComponents} onChange={(e) => setManualComponents(e.target.value)} />
          <TextField fullWidth label="Total Cost ($)" type="number" value={manualCost} onChange={(e) => setManualCost(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setManualBOMOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleManualBoM}>Save Proprietary BoM</Button>
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
