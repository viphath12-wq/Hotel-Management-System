<template>
  <div style="display: none;"></div>
</template>

<script setup>
const print = (reservation) => {
  const r = reservation
  if (!r?.id) return

  const guestName = r.guest || 'N/A'
  const guestEmail = r.email || 'N/A'
  const roomLabel = r.room || 'N/A'
  const checkIn = r.checkIn || ''
  const checkOut = r.checkOut || ''
  const statusLabel = r.statusLabel || ''
  const total = r.total || '0.00'
  const paymentStatus = r.raw?.payment_status || 'N/A'

  const win = window.open('', '_blank', 'width=900,height=650')
  if (!win) return

  win.document.open()
  win.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice #${r.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          .header { display:flex; justify-content: space-between; align-items:flex-start; margin-bottom: 20px; }
          .brand { font-size: 20px; font-weight: 700; }
          .muted { color: #666; }
          .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 14px; }
          .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .row { display:flex; justify-content: space-between; gap: 12px; }
          .label { font-size: 12px; color: #666; }
          .value { font-size: 14px; font-weight: 600; }
          .total { font-size: 22px; font-weight: 800; }
          @media print { body { padding: 0; } .no-print { display:none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Hotel Invoice</div>
            <div class="muted">Reservation #${r.id}</div>
          </div>
          <div class="muted">${new Date().toLocaleString()}</div>
        </div>

        <div class="card">
          <div class="grid">
            <div>
              <div class="label">Guest</div>
              <div class="value">${guestName}</div>
              <div class="label" style="margin-top:8px;">Email</div>
              <div class="value">${guestEmail}</div>
            </div>
            <div>
              <div class="label">Room</div>
              <div class="value">${roomLabel}</div>
              <div class="label" style="margin-top:8px;">Status</div>
              <div class="value">${statusLabel}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="grid">
            <div>
              <div class="label">Check-in</div>
              <div class="value">${checkIn}</div>
            </div>
            <div>
              <div class="label">Check-out</div>
              <div class="value">${checkOut}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="row">
            <div>
              <div class="label">Payment Status</div>
              <div class="value">${paymentStatus}</div>
            </div>
            <div style="text-align:right;">
              <div class="label">Total</div>
              <div class="total">$${total}</div>
            </div>
          </div>
        </div>

        <div class="no-print muted" style="margin-top: 10px;">Tip: Use your browser Print dialog to save as PDF.</div>
        <script>
          window.onload = function() { window.print(); };
        <\/script>
      </body>
    </html>
  `)
  win.document.close()
}

defineExpose({ print })
</script>
