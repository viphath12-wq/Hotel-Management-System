<template>
  <div style="display: none;"></div>
</template>

<script setup>
const props = defineProps({
  reportPeriod: {
    type: String,
    required: true,
  },
  range: {
    type: Object,
    required: true,
  },
  kpis: {
    type: Object,
    required: true,
  },
  monthlySummary: {
    type: Array,
    required: true,
  },
})

const exportPdf = () => {
  const periodLabelMap = {
    week: 'Last 7 Days',
    month: 'Last Month',
    quarter: 'Last Quarter',
    year: 'Last Year',
    custom: 'Custom Range',
  }

  const periodLabel = periodLabelMap[props.reportPeriod] || props.reportPeriod
  const title = `Reports & Analytics - ${periodLabel}`

  const rowsHtml = (props.monthlySummary || [])
    .map(
      (r) => `
      <tr>
        <td>${r.month}</td>
        <td>${r.occupancy}%</td>
        <td>$${r.adr}</td>
        <td>$${r.revpar}</td>
        <td>$${r.revenue}</td>
        <td>${r.bookings}</td>
      </tr>
    `,
    )
    .join('')

  const win = window.open('', '_blank', 'width=1000,height=700')
  if (!win) return

  win.document.open()
  win.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          .header { display:flex; justify-content: space-between; align-items:flex-start; margin-bottom: 16px; }
          .brand { font-size: 20px; font-weight: 800; }
          .muted { color: #666; font-size: 12px; }
          .kpis { display:grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 14px 0 18px; }
          .kpi { border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
          .kpi .label { font-size: 12px; color:#666; }
          .kpi .value { font-size: 18px; font-weight: 800; margin-top: 6px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #e5e7eb; padding: 10px; font-size: 12px; }
          th { background: #f9fafb; text-align:left; }
          .section-title { font-size: 14px; font-weight: 800; margin: 18px 0 10px; }
          @media print {
            body { padding: 0; }
            .no-print { display:none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">${title}</div>
            <div class="muted">Range: ${props.range?.start || ''} to ${props.range?.end || ''} (${props.range?.days || 0} days)</div>
          </div>
          <div class="muted">Generated: ${new Date().toLocaleString()}</div>
        </div>

        <div class="kpis">
          <div class="kpi"><div class="label">Average Occupancy</div><div class="value">${props.kpis.occupancy_rate}%</div></div>
          <div class="kpi"><div class="label">ADR</div><div class="value">$${props.kpis.adr}</div></div>
          <div class="kpi"><div class="label">RevPAR</div><div class="value">$${props.kpis.revpar}</div></div>
          <div class="kpi"><div class="label">Total Revenue</div><div class="value">$${props.kpis.total_revenue}</div></div>
        </div>

        <div class="section-title">Monthly Performance Summary</div>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Occupancy</th>
              <th>ADR</th>
              <th>RevPAR</th>
              <th>Total Revenue</th>
              <th>Bookings</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="6" style="text-align:center;color:#666;">No data</td></tr>'}
          </tbody>
        </table>

        <div class="no-print muted" style="margin-top: 10px;">Tip: Use Print dialog and choose “Save as PDF”.</div>
        <script>
          window.onload = function() { window.print(); };
        <\/script>
      </body>
    </html>
  `)
  win.document.close()
}

defineExpose({ exportPdf })
</script>
