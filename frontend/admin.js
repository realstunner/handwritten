const token = localStorage.getItem('jwt');

// -------------------- Load Orders --------------------
async function fetchOrders() {
  try {
    const res = await fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const orders = await res.json();

    const container = document.getElementById('order-list');
    container.innerHTML = '';

    orders.forEach((order) => {
      const card = document.createElement('div');
      card.className = 'order-card';

      card.innerHTML = `
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Filename:</strong> ${order.filename}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <p><strong>Total Price:</strong> ₹${order.totalAmount}</p>
        <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
        <p><strong>Receiver Phone:</strong> ${order.receiverPhone}</p>
        <p><strong>User:</strong> ${order.user?.name || 'N/A'} (${order.user?.phone || 'N/A'})</p>
        
        <div class="payment-proof">
          <strong>Payment Proof:</strong><br/>
          ${order.paymentProofUrl ? `<img src="${order.paymentProofUrl}" alt="Payment Proof"/>` : 'No Proof Uploaded'}
        </div>

        <div class="order-actions">
          <label for="status-${order._id}">Status:</label>
          <select id="status-${order._id}" onchange="updateStatus('${order._id}', this.value)">
            ${['Pending', 'Order Confirmed', 'processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map(
              (status) => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`
            ).join('')}
          </select>

          ${order.status === 'Cancelled' && order.cancellationReason ? `
            <p><strong>Reason:</strong> ${order.cancellationReason}</p>
          ` : ''}
        </div>
        ${order.pdfUrl ? `<div class="actions"><a href="${order.pdfUrl}" target="_blank">Download PDF</a></div>` : ''}
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    alert('Error loading orders.');
  }
}

async function updateStatus(orderId, status) {
  const reason = status === 'Cancelled'
    ? prompt('Enter cancellation reason:')
    : null;

  try {
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status, cancellationReason: reason }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('Status updated.');
      fetchOrders();
    } else {
      alert(data.message || 'Error updating status.');
    }
  } catch (err) {
    console.error(err);
    alert('Request failed.');
  }
}

// -------------------- QR Management --------------------
async function getQR() {
  try {
    const res = await fetch('/api/qr/latest');
    const data = await res.json();

    const qrDiv = document.getElementById('qr-current');
    if (data && data.url) {
      qrDiv.innerHTML = `<p><strong>Current QR:</strong></p><img src="${data.url}" alt="Current QR Code"/>`;
    } else {
      qrDiv.innerHTML = `<p>No QR uploaded yet.</p>`;
    }
  } catch (err) {
    console.error(err);
    document.getElementById('qr-current').innerHTML = `<p>Error fetching QR.</p>`;
  }
}

async function uploadQR() {
  const fileInput = document.getElementById('qr-upload');
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a QR image file to upload.');
    return;
  }

  const formData = new FormData();
  formData.append('qrImage', file);

  try {
    const res = await fetch('/api/qr/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      alert('QR updated successfully.');
      getQR();
      fileInput.value = '';
    } else {
      alert(data.message || 'QR upload failed.');
    }
  } catch (err) {
    console.error(err);
    alert('Error uploading QR.');
  }
}

// -------------------- Init --------------------
fetchOrders();
getQR();
