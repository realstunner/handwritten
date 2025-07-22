let uploadedFile = null;
let pageCount = 0;
let totalPrice = 0;
let uploadedFilename = "";
let uploadedFileUrl = "";
const deliveryCharge = 30;

document.addEventListener("DOMContentLoaded", () => {
  const deliveryAddressInput = document.getElementById("delivery-address");
  const receiverPhoneInput = document.getElementById("receiver-phone");
  const receiverNameInput = document.getElementById("receiver-name");
  const pageCountLabel = document.getElementById("page-count");
  const totalCostLabel = document.getElementById("total-cost");
  const submitOrderButton = document.getElementById("submit-order-button");
  const previewCanvas = document.getElementById("pdf-preview");
  const transactionIdInput = document.getElementById("transaction-id");
  const paymentProofInput = document.getElementById("payment-proof");
  const ctx = previewCanvas.getContext("2d");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    alert("Please login first.");
    return (window.location.href = "auth.html");
  }

  document.getElementById("file-upload").addEventListener("change", handleFileUpload);

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") {
      return alert("❌ Please upload a valid PDF file.");
    }

    uploadedFile = file;
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("/api/upload/pdf", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!data.success) return alert("❌ Upload failed: " + data.message);

      pageCount = data.pageCount;
      totalPrice = (pageCount * 5) + deliveryCharge;
      uploadedFilename = data.originalName;
      uploadedFileUrl = data.fileUrl;

      pageCountLabel.textContent = `📄 Page Count: ${pageCount}`;
      totalCostLabel.textContent = `💰 Total Cost: ₹${pageCount * 5} + ₹${deliveryCharge} = ₹${totalPrice}`;

      submitOrderButton.style.display = "inline-block";
      deliveryAddressInput.style.display = "block";
      receiverPhoneInput.style.display = "block";
      receiverNameInput.style.display = "block";
      transactionIdInput.style.display = "block";
      paymentProofInput.style.display = "block";
      previewCanvas.style.display = "block";
      document.getElementById("payment-warning").style.display = "block";

      const reader = new FileReader();
      reader.onload = () => {
        const typedArray = new Uint8Array(reader.result);
        pdfjsLib.getDocument(typedArray).promise.then((pdf) => {
          pdf.getPage(1).then((page) => {
            const viewport = page.getViewport({ scale: 1.2 });
            previewCanvas.width = viewport.width;
            previewCanvas.height = viewport.height;
            page.render({ canvasContext: ctx, viewport });
          });
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed. Check console for details.");
    }
  }

  submitOrderButton.addEventListener("click", async () => {
    const deliveryAddress = deliveryAddressInput.value.trim();
    const receiverPhone = receiverPhoneInput.value.trim();
    const receiverName = receiverNameInput.value.trim();
    const transactionId = transactionIdInput.value.trim();
    const paymentProofFile = paymentProofInput.files[0];

    if (!deliveryAddress || !receiverPhone || !receiverName || !transactionId || !paymentProofFile) {
      return alert("❗ Please complete all payment and delivery details.");
    }
    
    try {
      const formData = new FormData();
      formData.append("filename", uploadedFilename);
      formData.append("fileUrl", uploadedFileUrl);
      formData.append("pageCount", pageCount);
      formData.append("totalPrice", totalPrice);
      formData.append("deliveryAddress", deliveryAddress);
      formData.append("receiverPhone", receiverPhone);
      formData.append("receiverName", receiverName);
      formData.append("signature", user.signature || "");
      formData.append("manualPaymentTxnId", transactionId);
      formData.append("paymentProofImage", paymentProofFile);

      const response = await fetch("/api/payment/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert("✅ Order submitted successfully! Admin will confirm shortly.");
        window.location.reload();
      } else {
        alert("❌ Order submission failed: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Order submission failed.");
    }
  });

  window.logout = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "auth.html";
  };
});
