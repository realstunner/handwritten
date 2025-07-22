document.addEventListener("DOMContentLoaded", () => {
  const signUpForm = document.getElementById("signUpForm");
  const loginForm = document.getElementById("loginForm");
  const formTitle = document.getElementById("formTitle");
  const toggleText = document.querySelector(".toggle");

  const canvas = document.getElementById("signaturePad");
  const ctx = canvas.getContext("2d");
  let drawing = false;

  // 📝 Signature Pad
  canvas.addEventListener("mousedown", () => drawing = true);
  canvas.addEventListener("mouseup", () => { drawing = false; ctx.beginPath(); });
  canvas.addEventListener("mouseout", () => { drawing = false; ctx.beginPath(); });
  canvas.addEventListener("mousemove", draw);
  function draw(e) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }
  window.clearSignature = () => ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ✨ Toggle System
  let isSignUp = true;
  toggleText.addEventListener("click", () => {
    isSignUp = !isSignUp;
    signUpForm.classList.toggle("hidden");
    loginForm.classList.toggle("hidden");
    formTitle.textContent = isSignUp ? "Sign Up" : "Login";
    toggleText.textContent = isSignUp ? "Switch to Login" : "Switch to Sign Up";
  });

  // ✅ Send OTP
  document.getElementById("sendOtpBtn").addEventListener("click", async () => {
    const email = document.getElementById("signupEmail").value;
    if (!email) return alert("Enter email");
    const res = await fetch("http://localhost:5000/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    alert(data.message);
  });

  // 🔐 Register
  signUpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = {
      username: document.getElementById("username").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("signupEmail").value,
      password: document.getElementById("signupPassword").value,
      otp: document.getElementById("OTP").value,
      signature: canvas.toDataURL()
    };
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });
    const data = await res.json();
    alert(data.message);
    if (data.success) toggleText.click(); // Switch to login
  });

  // 🔑 Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Login successful!");
      window.location.href = "index.html";
    } else {
      alert(data.message);
    }
  });
});
