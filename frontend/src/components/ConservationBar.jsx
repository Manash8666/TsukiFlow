import React from 'react';
import { Box, Typography, Tooltip, Chip } from '@mui/material';
import { CheckCircle, WarningAmber } from '@mui/icons-material';

/**
 * Q58. What replaces the donut?
 * Answer: A conservation bar per stage card whose segments
 * (Under-production, Approved, Rejected, Surplus, Wastage) always sum to issued;
 * DETAILS opens the bucket table; drill reaches stock lines.
 * (Citation: Decision Corpus v1 §Q58)
 */
export default function ConservationBar({
  issued = 100,
  underProduction = 0,
  approved = 0,
  rejected = 0,
  surplus = 0,
  wastage = 0,
  uom = 'units',
  showLegend = true,
  height = 14,
}) {
  const totalAccounted = underProduction + approved + rejected + surplus + wastage;
  const isBalanced = Math.abs(issued - totalAccounted) < 0.001;

  // Compute percentages
  const safeIssued = issued > 0 ? issued : 1;
  const pctUnder = (underProduction / safeIssued) * 100;
  const pctApp = (approved / safeIssued) * 100;
  const pctRej = (rejected / safeIssued) * 100;
  const pctSur = (surplus / safeIssued) * 100;
  const pctWst = (wastage / safeIssued) * 100;

  const segments = [
    { label: 'Under-Production', qty: underProduction, pct: pctUnder, color: '#3b82f6' },
    { label: 'Approved Output', qty: approved, pct: pctApp, color: '#10b981' },
    { label: 'Rejected Defect', qty: rejected, pct: pctRej, color: '#ef4444' },
    { label: 'Surplus Recoverable', qty: surplus, pct: pctSur, color: '#8b5cf6' },
    { label: 'Absorbed Wastage', qty: wastage, pct: pctWst, color: '#f59e0b' },
  ];

  return (
    <Box sx={{ width: '100%', my: 1 }}>
      {/* Top Header with Invariant Badge */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 0.5 }}>
          CONSERVATION BAR: {issued} {uom} ISSUED
        </Typography>
        <Chip
          icon={isBalanced ? <CheckCircle sx={{ fontSize: '13px !important' }} /> : <WarningAmber sx={{ fontSize: '13px !important' }} />}
          label={isBalanced ? 'Balanced (100%)' : `Leakage: ${(issued - totalAccounted).toFixed(2)}`}
          size="small"
          color={isBalanced ? 'success' : 'error'}
          variant="outlined"
          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, px: 0.5 }}
        />
      </Box>

      {/* Segmented Horizontal Conservation Bar */}
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {segments.map((seg, idx) => {
          if (seg.qty <= 0) return null;
          return (
            <Tooltip
              key={idx}
              title={`${seg.label}: ${seg.qty} ${uom} (${seg.pct.toFixed(1)}%)`}
              arrow
            >
              <Box
                sx={{
                  width: `${Math.min(seg.pct, 100)}%`,
                  bgcolor: seg.color,
                  transition: 'width 0.4s ease',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.85, filter: 'brightness(1.15)' },
                }}
              />
            </Tooltip>
          );
        })}
      </Box>

      {/* Legend Pills */}
      {showLegend && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1, alignItems: 'center' }}>
          {segments.map((seg, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: seg.color }} />
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                {seg.label}: <b>{seg.qty}</b>
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
