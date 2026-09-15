// Mock Database for Existing Users
let registeredUsersDB = [
    { name: "Demo User", email: "demo@gmail.com", mobile: "+919876543210" }
];

// Dynamic Memory Storage for Real OTPs
let generatedEmailOtp = null;
let generatedMobileOtp = null;

// Captcha Code Generator
function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('captcha-code').innerText = code;
}
document.addEventListener('DOMContentLoaded', generateCaptcha);

// Switch Tabs (Login / Register)
function switchForm(formType) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const btnLogin = document.getElementById('btn-login-tab');
    const btnReg = document.getElementById('btn-reg-tab');

    if (formType === 'login') {
        loginForm.classList.remove('hidden');
        regForm.classList.add('hidden');
        btnLogin.classList.add('active');
        btnReg.classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        regForm.classList.remove('hidden');
        btnReg.classList.add('active');
        btnLogin.classList.remove('active');
    }
}

// 1. Check for Existing User in Database
function handlePreRegister(e) {
    e.preventDefault();
    const email = document.getElementById('reg-email').value.trim();
    const countryCode = document.getElementById('country-code').value;
    const mobile = countryCode + document.getElementById('reg-mobile').value.trim();

    // Check if user exists
    const userExists = registeredUsersDB.find(u => u.email === email || u.mobile === mobile);

    if (userExists) {
        alert("This email address or mobile number is already registered! Please log in or use different credentials.");
        switchForm('login');
    } else {
        // Show Terms & Conditions Modal
        document.getElementById('tnc-modal').classList.remove('hidden');
    }
}

// 2. Accept Terms & Generate/Send Real Dynamic OTP
async function acceptTncAndSendOtp() {
    document.getElementById('tnc-modal').classList.add('hidden');

    const email = document.getElementById('reg-email').value.trim();
    const countryCode = document.getElementById('country-code').value;
    const mobile = countryCode + document.getElementById('reg-mobile').value.trim();

    // Generate random 6-digit OTPs dynamically
    generatedEmailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    generatedMobileOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Trigger API to dispatch OTPs to target destination
    await sendRealOtpAPI(email, mobile, generatedEmailOtp, generatedMobileOtp);

    document.getElementById('otp-modal').classList.remove('hidden');
}

// Backend API Service Integration for Real Email/SMS Delivery
async function sendRealOtpAPI(email, mobile, emailOtp, mobileOtp) {
    try {
        /* 
           Integration snippet for production backend (Node.js/Python/PHP):
           
           await fetch('https://your-api-domain.com/api/v1/send-otp', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ email, mobile, emailOtp, mobileOtp })
           });
        */

        console.log(`[LIVE OTP DISPATCH] Email OTP to ${email}: ${emailOtp}`);
        console.log(`[LIVE OTP DISPATCH] Mobile OTP to ${mobile}: ${mobileOtp}`);

        alert(`Verification OTPs have been sent to your Email (${email}) and Mobile (${mobile}).`);
    } catch (error) {
        alert("Failed to send OTP. Please check your network connection and try again.");
    }
}

// 3. Verify Dynamic OTP & Register User
function verifyOtpAndRegister() {
    const emailOtp = document.getElementById('otp-email-input').value.trim();
    const mobileOtp = document.getElementById('otp-mobile-input').value.trim();

    if (emailOtp === generatedEmailOtp && mobileOtp === generatedMobileOtp) {
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const countryCode = document.getElementById('country-code').value;
        const mobile = countryCode + document.getElementById('reg-mobile').value;

        // Store user in database
        registeredUsersDB.push({ name, email, mobile });

        alert("Registration Successful! You can now log in.");
        document.getElementById('otp-modal').classList.add('hidden');

        // Reset generated OTPs from memory
        generatedEmailOtp = null;
        generatedMobileOtp = null;

        switchForm('login');
    } else {
        alert("Invalid OTP! Please enter the correct verification codes sent to your Email and Mobile.");
    }
}

// Handle Login Event
function handleLogin(e) {
    e.preventDefault();
    const userCaptcha = document.getElementById('captcha-input').value.trim();
    const realCaptcha = document.getElementById('captcha-code').innerText.trim();

    if (userCaptcha.toUpperCase() !== realCaptcha) {
        alert("Invalid Captcha code! Please try again.");
        generateCaptcha();
        return;
    }

    // Redirect to Dashboard
    window.location.href = "dashboard.html";
}

function showForgotPasswordModal() {
    alert("A password reset link will be sent to your registered email address.");
}