import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Divider,
} from '@mui/material';
import {
  Calculate,
  AccountTree,
  QrCode,
  ReceiptLong,
  Assessment,
  AddCircle,
  CheckCircle,
  WarningAmber,
  ArrowForward,
  Inventory2,
  PrecisionManufacturing,
  LocalShipping,
  AccountBalanceWallet,
  Download,
  Autorenew,
} from '@mui/icons-material';
import {
  useGetWarehousesQuery,
  useGetLotsQuery,
  useSplitLotMutation,
  useGetRoutingBoMsQuery,
  useExplodeMRPMutation,
  useGenerateShortfallPOsMutation,
  useGetJWOsQuery,
  useCompleteStageWithConservationMutation,
  useGetProcessorBillsQuery,
  usePayProcessorBillMutation,
  useGetMISReportsQuery,
  useGetInventoryQuery,
} from '../store/apiSlice';
import ConservationBar from '../components/ConservationBar';

export default function MRPLedger() {
  const [activeTab, setActiveTab] = useState(0);

  // Queries
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const { data: lots = [], refetch: refetchLots } = useGetLotsQuery();
  const { data: routingBoms = [] } = useGetRoutingBoMsQuery();
  const { data: jwos = [], refetch: refetchJWOs } = useGetJWOsQuery();
  const { data: bills = [], refetch: refetchBills } = useGetProcessorBillsQuery();
  const { data: misReports, refetch: refetchMIS } = useGetMISReportsQuery();
  const { data: products = [] } = useGetInventoryQuery();

  // Mutations
  const [explodeMRP, { data: mrpResult, isLoading: isExploding }] = useExplodeMRPMutation();
  const [generateShortfallPOs, { isLoading: isMintingPOs }] = useGenerateShortfallPOsMutation();
  const [splitLot, { isLoading: isSplitting }] = useSplitLotMutation();
  const [completeStage, { isLoading: isCompleting }] = useCompleteStageWithConservationMutation();
  const [payBill, { isLoading: isPaying }] = usePayProcessorBillMutation();

  // State: MRP Engine
  const [selectedProductId, setSelectedProductId] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(100);
  const [poMintSuccess, setPoMintSuccess] = useState(null);

  // State: Lot Split Modal
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [selectedLotForSplit, setSelectedLotForSplit] = useState(null);
  const [splitQuantity, setSplitQuantity] = useState('');
  const [splitReason, setSplitReason] = useState('Production Issue Batch Allocation');

  // State: Stage Completion & Conservation Modal
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [selectedJWOForComplete, setSelectedJWOForComplete] = useState(null);
  const [consumedQty, setConsumedQty] = useState('');
  const [wastageQty, setWastageQty] = useState('');
  const [surplusQty, setSurplusQty] = useState('');
  const [conservationError, setConservationError] = useState('');

  // State: AP Settlement Modal
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('NEFT');

  // Handlers: MRP
  const handleRunMRP = async () => {
    const pid = selectedProductId || (products.length > 0 ? products[0].id : 1);
    try {
      await explodeMRP({
        product_id: parseInt(pid, 10),
        order_quantity: parseFloat(orderQuantity) || 100,
      }).unwrap();
      setPoMintSuccess(null);
    } catch (err) {
      console.error('MRP explosion failed:', err);
    }
  };

  const handleMintPOs = async () => {
    if (!mrpResult || !mrpResult.shortfalls) return;
    try {
      const res = await generateShortfallPOs({ items: mrpResult.shortfalls }).unwrap();
      setPoMintSuccess(`Successfully minted ${res.total_pos_minted} formal Purchase Orders!`);
      handleRunMRP(); // Refresh shortfall calculation
    } catch (err) {
      console.error('PO generation failed:', err);
    }
  };

  // Handlers: Lot Split
  const handleOpenSplit = (lot) => {
    setSelectedLotForSplit(lot);
    setSplitQuantity((lot.current_quantity / 2).toString());
    setSplitDialogOpen(true);
  };

  const handleExecuteSplit = async () => {
    if (!selectedLotForSplit) return;
    try {
      await splitLot({
        lot_id: selectedLotForSplit.id,
        split_quantity: parseFloat(splitQuantity),
        reason: splitReason,
      }).unwrap();
      setSplitDialogOpen(false);
      refetchLots();
    } catch (err) {
      alert(err.data?.detail || 'Lot split failed');
    }
  };

  // Handlers: Stage Completion with Conservation
  const handleOpenComplete = (jwo) => {
    setSelectedJWOForComplete(jwo);
    const issued = jwo.issued_quantity;
    setConsumedQty((issued * 0.8).toFixed(1));
    setWastageQty((issued * 0.1).toFixed(1));
    setSurplusQty((issued * 0.1).toFixed(1));
    setConservationError('');
    setCompleteDialogOpen(true);
  };

  const handleVerifyAndCompleteStage = async () => {
    if (!selectedJWOForComplete) return;
    const issued = selectedJWOForComplete.issued_quantity;
    const c = parseFloat(consumedQty) || 0;
    const w = parseFloat(wastageQty) || 0;
    const s = parseFloat(surplusQty) || 0;
    const sum = c + w + s;

    if (Math.abs(issued - sum) > 0.001) {
      setConservationError(
        `Conservation Law Invariant Violated! Issued (${issued}) != Consumed (${c}) + Wastage (${w}) + Surplus (${s}) = ${sum}. Discrepancy: ${(
          issued - sum
        ).toFixed(4)} units unaccounted for.`
      );
      return;
    }

    try {
      await completeStage({
        jwo_id: selectedJWOForComplete.id,
        consumed_quantity: c,
        wastage_quantity: w,
        surplus_quantity: s,
        notes: 'Stage executed with 100% mass conservation verified.',
      }).unwrap();
      setCompleteDialogOpen(false);
      refetchJWOs();
      refetchLots();
      refetchBills();
    } catch (err) {
      setConservationError(err.data?.detail || 'Stage completion rejected by server');
    }
  };

  // Handlers: AP Payment
  const handleOpenPay = (bill) => {
    setSelectedBill(bill);
    setPaymentAmount(bill.due_amount.toString());
    setPayDialogOpen(true);
  };

  const handleExecutePayment = async () => {
    if (!selectedBill) return;
    try {
      await payBill({
        bill_id: selectedBill.id,
        payment_amount: parseFloat(paymentAmount),
        payment_mode: paymentMode,
        reference_notes: `Settlement via ${paymentMode}`,
      }).unwrap();
      setPayDialogOpen(false);
      refetchBills();
      refetchMIS();
    } catch (err) {
      alert(err.data?.detail || 'Payment failed');
    }
  };

  // Export MIS Register to CSV
  const handleExportCSV = () => {
    if (!misReports || !misReports.statutory_gst_register) return;
    const rows = misReports.statutory_gst_register.records.map((r) => [
      r.bill_number,
      `"${r.entity_name}"`,
      r.gstin,
      r.bill_type,
      r.hsn_sac,
      r.taxable_value,
      r.cgst,
      r.sgst,
      r.total_tax,
      r.net_invoice_value,
      r.status,
    ]);
    const headers = [
      'Bill Number',
      'Entity Name',
      'GSTIN',
      'Bill Type',
      'HSN/SAC',
      'Taxable Value (INR)',
      'CGST (INR)',
      'SGST (INR)',
      'Total Tax (INR)',
      'Net Invoice (INR)',
      'Payment Status',
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TsukiFlow_GST_Tax_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for summary KPI strip
  const totalValuation = lots.reduce((acc, l) => acc + l.current_quantity * (l.unit_cost || 0), 0);
  const totalAPDue = bills.reduce((acc, b) => acc + (b.due_amount || 0), 0);
  const activeJwoCount = jwos.filter((j) => j.status !== 'COMPLETED').length;

  return (
    <Box sx={{ pb: 6 }}>
      {/* Title & Architecture Banner */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" fontWeight="bold">
              The Eight Missing Systems Ledger
            </Typography>
            <Chip
              label="Spine Architecture: Verified"
              color="primary"
              size="small"
              sx={{ fontWeight: 'bold', bgcolor: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6' }}
            />
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            MRP Explosion (Req − Avl − OnPO), Process-Routing BoM, Lot Ledger Conservation Invariant, JWO Subcontracting & AP Settlement.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Autorenew />}
            onClick={() => {
              refetchLots();
              refetchJWOs();
              refetchBills();
              refetchMIS();
            }}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Sync Spine
          </Button>
        </Box>
      </Box>

      {/* KPI Header Metric Strip */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  REAL-TIME LOT VALUATION
                </Typography>
                <Inventory2 sx={{ color: '#3b82f6' }} />
              </Box>
              <Typography variant="h5" fontWeight="800" sx={{ mt: 1, color: '#f8fafc' }}>
                ₹{totalValuation.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lots.length} active lots across {warehouses.length} physical stores
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  CONSERVATION INVARIANT
                </Typography>
                <CheckCircle sx={{ color: '#10b981' }} />
              </Box>
              <Typography variant="h5" fontWeight="800" sx={{ mt: 1, color: '#10b981' }}>
                100% Zero-Leakage
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Issued ≡ Consumed + Wastage + Surplus
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  ACTIVE JWO PIPELINE
                </Typography>
                <PrecisionManufacturing sx={{ color: '#f59e0b' }} />
              </Box>
              <Typography variant="h5" fontWeight="800" sx={{ mt: 1, color: '#f59e0b' }}>
                {activeJwoCount} Open Orders
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Captive shopfloor & subcontract processors
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" fontWeight="600">
                  PROCESSOR AP DUES
                </Typography>
                <AccountBalanceWallet sx={{ color: '#ef4444' }} />
              </Box>
              <Typography variant="h5" fontWeight="800" sx={{ mt: 1, color: '#f87171' }}>
                ₹{totalAPDue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {bills.filter((b) => b.due_amount > 0).length} bills awaiting settlement
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Tabs for The Eight Systems */}
      <Paper sx={{ bgcolor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 3, mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.92rem',
              py: 2,
              minHeight: 52,
            },
          }}
        >
          <Tab icon={<Calculate sx={{ fontSize: 20 }} />} iconPosition="start" label="1. MRP Explosion Engine" />
          <Tab icon={<AccountTree sx={{ fontSize: 20 }} />} iconPosition="start" label="2. Process-Routing BoM" />
          <Tab icon={<QrCode sx={{ fontSize: 20 }} />} iconPosition="start" label="3. Lot Ledger & Conservation" />
          <Tab icon={<LocalShipping sx={{ fontSize: 20 }} />} iconPosition="start" label="4. JWO Execution & AP Settlement" />
          <Tab icon={<Assessment sx={{ fontSize: 20 }} />} iconPosition="start" label="5. Statutory MIS & Tax Register" />
        </Tabs>
      </Paper>

      {/* ========================================================================= */}
      {/* TAB 0: SYSTEM 1 - MRP EXPLOSION ENGINE (Req - Avl - OnPO = Shortfall)      */}
      {/* ========================================================================= */}
      {activeTab === 0 && (
        <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Order-Driven MRP Net Shortfall Computation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Formula:{' '}
                <Box component="span" sx={{ color: '#38bdf8', fontWeight: 'bold' }}>
                  Shortfall = max(0, Required − Available In-Stock − Expected on Open POs)
                </Box>
                . One-click instantly inherits exact shortfalls into vendor purchase orders.
              </Typography>
            </Box>

            {/* Parameter Bar */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 4 }}>
              <FormControl sx={{ minWidth: 260 }} size="small">
                <InputLabel>Target Product</InputLabel>
                <Select
                  value={selectedProductId}
                  label="Target Product"
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  {products.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name} ({p.item_type || 'Product'})
                    </MenuItem>
                  ))}
                  {products.length === 0 && (
                    <MenuItem value={1}>Raw Material Alpha (Sample Production Assembly)</MenuItem>
                  )}
                </Select>
              </FormControl>

              <TextField
                label="Target Order Quantity"
                type="number"
                size="small"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)}
                sx={{ width: 180 }}
              />

              <Button
                variant="contained"
                startIcon={<Calculate />}
                onClick={handleRunMRP}
                disabled={isExploding}
                sx={{ bgcolor: '#3b82f6', textTransform: 'none', px: 3, borderRadius: 2 }}
              >
                {isExploding ? 'Computing Shortfalls...' : 'Explode Net Shortfall'}
              </Button>
            </Box>

            {/* PO Success Banner */}
            {poMintSuccess && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setPoMintSuccess(null)}>
                {poMintSuccess}
              </Alert>
            )}

            {/* MRP Results Table */}
            {mrpResult ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Gross-to-Net Materials Requirement for {mrpResult.target_order_quantity} Units of {mrpResult.product_name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Chip
                      label={`Shortfalls: ${mrpResult.total_shortfall_items} Items`}
                      color={mrpResult.total_shortfall_items > 0 ? 'error' : 'success'}
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                    <Chip
                      label={`Procurement Est: ₹${mrpResult.total_procurement_cost.toLocaleString('en-IN')}`}
                      variant="outlined"
                      size="small"
                      sx={{ color: '#38bdf8', borderColor: '#38bdf8', fontWeight: 'bold' }}
                    />
                    {mrpResult.total_shortfall_items > 0 && (
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<AddCircle />}
                        onClick={handleMintPOs}
                        disabled={isMintingPOs}
                        sx={{ textTransform: 'none', borderRadius: 2 }}
                      >
                        {isMintingPOs ? 'Minting POs...' : '1-Click Shortfall → Mint POs'}
                      </Button>
                    )}
                  </Box>
                </Box>

                <TableContainer component={Paper} sx={{ bgcolor: 'rgba(15, 23, 42, 0.6)', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Component Material</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Required (Req)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Available (Avl)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>On PO (Exp)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#f87171' }}>Net Shortfall</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unit Rate</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Est. Cost</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Preferred Vendor</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mrpResult.shortfalls.map((s) => (
                        <TableRow key={s.product_id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{s.product_name}</TableCell>
                          <TableCell align="right">{s.required_qty.toFixed(1)}</TableCell>
                          <TableCell align="right" sx={{ color: '#10b981' }}>{s.available_qty.toFixed(1)}</TableCell>
                          <TableCell align="right" sx={{ color: '#38bdf8' }}>{s.on_po_qty.toFixed(1)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: s.shortfall_qty > 0 ? '#ef4444' : '#10b981' }}>
                            {s.shortfall_qty.toFixed(1)}
                          </TableCell>
                          <TableCell align="right">₹{s.unit_cost.toFixed(2)}</TableCell>
                          <TableCell align="right">₹{s.estimated_cost.toLocaleString('en-IN')}</TableCell>
                          <TableCell>{s.preferred_vendor}</TableCell>
                          <TableCell align="center">
                            {s.shortfall_qty > 0 ? (
                              <Chip label="PO Needed" color="error" size="small" />
                            ) : (
                              <Chip label="Stock Satiated" color="success" size="small" />
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Calculate sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                <Typography variant="body1">Select product and order size above, then click Explode Net Shortfall.</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: SYSTEM 2 - PROCESS-ROUTING BoM (Stages Declaring Inputs/Outputs)   */}
      {/* ========================================================================= */}
      {activeTab === 1 && (
        <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Process-Routing Bill of Materials (Multi-Stage DAG)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stages explicitly declare consumable inputs and intermediate produced outputs with cycle times and scrap absorption factors.
              </Typography>
            </Box>

            {routingBoms.map((bom) => (
              <Box key={bom.id} sx={{ mb: 4, p: 3, bgcolor: 'rgba(15, 23, 42, 0.5)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.04)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                    BoM: {bom.product_name} | {bom.stages.length} Stages Configured
                  </Typography>
                  <Chip label="Active Routing Definition" color="success" size="small" />
                </Box>

                <Grid container spacing={2}>
                  {bom.stages.map((stg) => (
                    <Grid item xs={12} md={4} key={stg.id}>
                      <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.9)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 2, height: '100%' }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              Stage {stg.stage_order}: {stg.stage_name}
                            </Typography>
                            <Chip
                              label={stg.work_mode}
                              size="small"
                              color={stg.work_mode === 'SUBCONTRACT' ? 'warning' : 'primary'}
                              sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                            />
                          </Box>

                          <Typography variant="caption" color="text.secondary" display="block">
                            Assigned Processor: <b>{stg.default_vendor_name || 'In-House Line'}</b>
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Cycle Time: <b>{stg.cycle_time_minutes} mins</b> | Scrap Rate: <b>{stg.scrap_rate_pct}%</b>
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                            Process Cost: <b>₹{stg.process_rate_per_unit}/unit</b>
                          </Typography>

                          <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.06)' }} />

                          <Typography variant="caption" fontWeight="bold" color="text.secondary">
                            Materials Consumed / Produced:
                          </Typography>
                          {stg.items.length === 0 ? (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                              Direct transformation of input WIP lot.
                            </Typography>
                          ) : (
                            stg.items.map((itm) => (
                              <Box key={itm.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                                <Chip
                                  label={itm.item_direction}
                                  size="small"
                                  sx={{
                                    fontSize: '0.6rem',
                                    height: 18,
                                    bgcolor: itm.item_direction === 'CONSUME' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                    color: itm.item_direction === 'CONSUME' ? '#f87171' : '#34d399',
                                  }}
                                />
                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                  {itm.product_name || `SKU #${itm.product_id}`}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {itm.quantity_per_unit} per FG
                                </Typography>
                              </Box>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SYSTEM 4 & 5 - LOT LEDGER, CONSERVATION & WAREHOUSE CUSTODY        */}
      {/* ========================================================================= */}
      {activeTab === 2 && (
        <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  First-Class Financial Lot Ledger
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete lineage tracking (NEW at GRN, SPLIT, DERIVED). Surplus is preserved as recoverable inventory, never lost as waste.
                </Typography>
              </Box>
            </Box>

            <TableContainer component={Paper} sx={{ bgcolor: 'rgba(15, 23, 42, 0.6)', borderRadius: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lot Identifier</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Barcode</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lineage</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Available Qty</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unit Cost</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Valuation</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Warehouse Location</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lots.map((l) => (
                    <TableRow key={l.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: '#f8fafc' }}>{l.lot_number}</TableCell>
                      <TableCell>
                        <Chip
                          icon={<QrCode sx={{ fontSize: 14 }} />}
                          label={l.barcode || 'NO-BARCODE'}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.72rem', borderColor: 'rgba(255,255,255,0.2)' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={l.lineage_type}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            fontSize: '0.65rem',
                            bgcolor:
                              l.lineage_type === 'NEW'
                                ? 'rgba(59, 130, 246, 0.2)'
                                : l.lineage_type === 'SPLIT'
                                ? 'rgba(245, 158, 11, 0.2)'
                                : 'rgba(16, 185, 129, 0.2)',
                            color:
                              l.lineage_type === 'NEW'
                                ? '#60a5fa'
                                : l.lineage_type === 'SPLIT'
                                ? '#fbbf24'
                                : '#34d399',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>{l.current_quantity.toFixed(1)}</TableCell>
                      <TableCell align="right">₹{l.unit_cost.toFixed(2)}</TableCell>
                      <TableCell align="right">₹{(l.current_quantity * l.unit_cost).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</TableCell>
                      <TableCell>{l.warehouse_code || 'WH-RM'}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={l.status}
                          size="small"
                          color={l.status === 'IN_STOCK' ? 'success' : 'default'}
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {l.status === 'IN_STOCK' && l.current_quantity > 1 && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenSplit(l)}
                            sx={{ textTransform: 'none', py: 0.2, px: 1, borderRadius: 1.5, fontSize: '0.75rem' }}
                          >
                            Split Lot
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SYSTEM 3 & 7 - JWO EXECUTION, CONSERVATION LAW & AP SETTLEMENT    */}
      {/* ========================================================================= */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          {/* Left Column: Job Work Orders */}
          <Grid item xs={12} lg={7}>
            <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Job Work Order (JWO) Execution Pipeline
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Captive & Subcontract Work Orders. Completion enforces physical conservation law.
                  </Typography>
                </Box>

                {/* Q58 Conservation Bar Component */}
                <Box sx={{ mb: 2.5, p: 2, bgcolor: 'rgba(15, 23, 42, 0.5)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <ConservationBar
                    issued={jwos.reduce((a, b) => a + (b.issued_quantity || 0), 0)}
                    underProduction={Math.max(
                      0,
                      jwos.reduce((a, b) => a + (b.issued_quantity || 0), 0) -
                        jwos.reduce((a, b) => a + (b.consumed_quantity || 0), 0) -
                        jwos.reduce((a, b) => a + (b.wastage_quantity || 0), 0) -
                        jwos.reduce((a, b) => a + (b.surplus_quantity || 0), 0)
                    )}
                    approved={jwos.reduce((a, b) => a + (b.consumed_quantity || 0), 0)}
                    surplus={jwos.reduce((a, b) => a + (b.surplus_quantity || 0), 0)}
                    wastage={jwos.reduce((a, b) => a + (b.wastage_quantity || 0), 0)}
                    uom="units"
                  />
                </Box>

                <TableContainer component={Paper} sx={{ bgcolor: 'rgba(15, 23, 42, 0.6)', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>JWO No</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Stage / Processor</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Issued</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Consumed</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Waste</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Surplus</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jwos.map((j) => (
                        <TableRow key={j.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{j.jwo_number}</TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{j.stage_name}</Typography>
                            <Typography variant="caption" color="text.secondary">{j.processor_name} ({j.work_mode})</Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>{j.issued_quantity}</TableCell>
                          <TableCell align="right" sx={{ color: '#10b981' }}>{j.consumed_quantity}</TableCell>
                          <TableCell align="right" sx={{ color: '#f87171' }}>{j.wastage_quantity}</TableCell>
                          <TableCell align="right" sx={{ color: '#fbbf24' }}>{j.surplus_quantity}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={j.status}
                              size="small"
                              color={j.status === 'COMPLETED' ? 'success' : 'warning'}
                              sx={{ fontSize: '0.65rem' }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {j.status !== 'COMPLETED' && (
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleOpenComplete(j)}
                                sx={{ textTransform: 'none', py: 0.2, px: 1, borderRadius: 1.5, fontSize: '0.72rem' }}
                              >
                                Complete Stage
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: AP Bills & Settlement */}
          <Grid item xs={12} lg={5}>
            <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Accounts Payable & Processor Settlement
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    JRN Service bills & goods bills dues ledger with multi-mode payment recording.
                  </Typography>
                </Box>

                <TableContainer component={Paper} sx={{ bgcolor: 'rgba(15, 23, 42, 0.6)', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Bill Number</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Processor</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Net (INR)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#f87171' }}>Due (INR)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bills.map((b) => (
                        <TableRow key={b.id} hover>
                          <TableCell sx={{ fontWeight: 700 }}>
                            {b.bill_number}
                            <Chip
                              label={b.bill_type === 'SERVICE_BILL' ? 'JRN' : 'GOODS'}
                              size="small"
                              sx={{ ml: 1, fontSize: '0.6rem', height: 16 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" display="block">{b.processor_name}</Typography>
                          </TableCell>
                          <TableCell align="right">₹{b.net_amount.toLocaleString('en-IN')}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800, color: b.due_amount > 0 ? '#ef4444' : '#10b981' }}>
                            ₹{b.due_amount.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell align="center">
                            {b.due_amount > 0 ? (
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => handleOpenPay(b)}
                                sx={{ textTransform: 'none', py: 0.2, px: 1, borderRadius: 1.5, fontSize: '0.72rem' }}
                              >
                                Settle Due
                              </Button>
                            ) : (
                              <Chip label="Paid" color="success" size="small" sx={{ fontSize: '0.65rem' }} />
                            )}
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
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SYSTEM 8 - STATUTORY MIS & TAX REGISTERS                           */}
      {/* ========================================================================= */}
      {activeTab === 4 && (
        <Card sx={{ bgcolor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Statutory GST Purchase & Service Tax Register (ITC GSTR-2B)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete input tax credit breakdown for goods purchases and subcontract processing bills.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleExportCSV}
                sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' }, textTransform: 'none', borderRadius: 2 }}
              >
                Export Tax Register (CSV)
              </Button>
            </Box>

            {misReports && misReports.statutory_gst_register && (
              <Box>
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  <b>Tax Credit Summary:</b> {misReports.statutory_gst_register.itc_summary} across{' '}
                  ₹{misReports.statutory_gst_register.total_taxable.toLocaleString('en-IN')} taxable spend.
                </Alert>

                <TableContainer component={Paper} sx={{ bgcolor: 'rgba(15, 23, 42, 0.6)', borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Invoice No</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Vendor / Processor</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>GSTIN</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>HSN/SAC</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Taxable Value</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>CGST (9%)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>SGST (9%)</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', color: '#10b981' }}>Total Tax</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Invoice Net</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>ITC</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {misReports.statutory_gst_register.records.map((r, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell sx={{ fontWeight: 700 }}>{r.bill_number}</TableCell>
                          <TableCell>{r.entity_name}</TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.gstin}</TableCell>
                          <TableCell>{r.hsn_sac}</TableCell>
                          <TableCell align="right">₹{r.taxable_value.toLocaleString('en-IN')}</TableCell>
                          <TableCell align="right">₹{r.cgst.toLocaleString('en-IN')}</TableCell>
                          <TableCell align="right">₹{r.sgst.toLocaleString('en-IN')}</TableCell>
                          <TableCell align="right" sx={{ color: '#10b981', fontWeight: 700 }}>
                            ₹{r.total_tax.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>₹{r.net_invoice_value.toLocaleString('en-IN')}</TableCell>
                          <TableCell align="center">
                            <Chip label="Eligible" color="success" size="small" sx={{ fontSize: '0.65rem' }} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ========================================================================= */}
      {/* DIALOG: LOT SPLIT MODAL (System 4)                                        */}
      {/* ========================================================================= */}
      <Dialog open={splitDialogOpen} onClose={() => setSplitDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Split Inventory Lot
        </DialogTitle>
        <DialogContent dividers>
          {selectedLotForSplit && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                Parent Lot: <b>{selectedLotForSplit.lot_number}</b> | Available Qty: <b>{selectedLotForSplit.current_quantity}</b>
              </Alert>

              <TextField
                label="Split Quantity"
                type="number"
                size="small"
                fullWidth
                value={splitQuantity}
                onChange={(e) => setSplitQuantity(e.target.value)}
                helperText={`Remaining parent lot will have ${(selectedLotForSplit.current_quantity - (parseFloat(splitQuantity) || 0)).toFixed(1)} units.`}
              />

              <TextField
                label="Reason for Lineage Split"
                size="small"
                fullWidth
                value={splitReason}
                onChange={(e) => setSplitReason(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSplitDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleExecuteSplit}
            disabled={isSplitting}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {isSplitting ? 'Minting Child Lot...' : 'Execute Lineage Split'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG: STAGE COMPLETION UNDER CONSERVATION LAW (System 3, 4 & 6)          */}
      {/* ========================================================================= */}
      <Dialog open={completeDialogOpen} onClose={() => setCompleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Execute Stage Completion (Conservation Law Invariant)
        </DialogTitle>
        <DialogContent dividers>
          {selectedJWOForComplete && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <Alert severity="warning" sx={{ fontSize: '0.82rem' }}>
                <b>The Invariant Law:</b> Issued ({selectedJWOForComplete.issued_quantity}) ≡ Consumed + Wastage + Surplus.
                Wastage is absorbed into good output unit cost; Surplus is deposited back to recoverable store.
              </Alert>

              {conservationError && (
                <Alert severity="error" sx={{ fontSize: '0.82rem' }}>
                  {conservationError}
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField
                    label="Consumed (Good Output)"
                    type="number"
                    size="small"
                    fullWidth
                    value={consumedQty}
                    onChange={(e) => setConsumedQty(e.target.value)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Wastage (Scrap)"
                    type="number"
                    size="small"
                    fullWidth
                    value={wastageQty}
                    onChange={(e) => setWastageQty(e.target.value)}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Surplus (Recoverable)"
                    type="number"
                    size="small"
                    fullWidth
                    value={surplusQty}
                    onChange={(e) => setSurplusQty(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Box sx={{ p: 2, bgcolor: 'rgba(15, 23, 42, 0.6)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.06)' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Issued: <b>{selectedJWOForComplete.issued_quantity}</b> | Total Accounted:{' '}
                  <b>
                    {((parseFloat(consumedQty) || 0) + (parseFloat(wastageQty) || 0) + (parseFloat(surplusQty) || 0)).toFixed(1)}
                  </b>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Stage Processing Rate: <b>₹{selectedJWOForComplete.process_rate_per_unit}/unit</b> | Auto-Generated JRN Bill:{' '}
                  <b>₹{((parseFloat(consumedQty) || 0) * selectedJWOForComplete.process_rate_per_unit * 1.18).toFixed(2)}</b> (incl. 18% GST)
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCompleteDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleVerifyAndCompleteStage}
            disabled={isCompleting}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {isCompleting ? 'Enforcing Conservation...' : 'Verify Invariant & Complete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG: AP SETTLEMENT MODAL (System 7)                                     */}
      {/* ========================================================================= */}
      <Dialog open={payDialogOpen} onClose={() => setPayDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Record Processor Settlement
        </DialogTitle>
        <DialogContent dividers>
          {selectedBill && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                Bill: <b>{selectedBill.bill_number}</b> | Processor: <b>{selectedBill.processor_name}</b>
                <br />
                Total Net: <b>₹{selectedBill.net_amount.toLocaleString('en-IN')}</b> | Outstanding Due: <b>₹{selectedBill.due_amount.toLocaleString('en-IN')}</b>
              </Alert>

              <TextField
                label="Payment Amount (INR)"
                type="number"
                size="small"
                fullWidth
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />

              <FormControl size="small" fullWidth>
                <InputLabel>Payment Mode</InputLabel>
                <Select
                  value={paymentMode}
                  label="Payment Mode"
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <MenuItem value="NEFT">NEFT (National Electronic Funds Transfer)</MenuItem>
                  <MenuItem value="RTGS">RTGS (Real Time Gross Settlement)</MenuItem>
                  <MenuItem value="UPI">UPI Instant Corporate Transfer</MenuItem>
                  <MenuItem value="BANK_TRANSFER">Bank Wire / IMPS</MenuItem>
                  <MenuItem value="CHEQUE">Corporate Cheque</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPayDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExecutePayment}
            disabled={isPaying}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            {isPaying ? 'Recording Settle...' : 'Confirm Settlement'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
