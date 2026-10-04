document.addEventListener('DOMContentLoaded', () => {
    generateCaptcha();

    // Register Tab Event Listener
    const btnReg = document.getElementById('btn-reg-tab');
    const btnLogin = document.getElementById('btn-login-tab');

    if (btnReg) {
        btnReg.removeAttribute('disabled'); // Disable હોય તો દૂર કરશે
        btnReg.style.cursor = 'pointer';
        btnReg.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('register');
        });
    }

    if (btnLogin) {
        btnLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchForm('login');
        });
    }
});
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
    const captchaElem = document.getElementById('captcha-code');
    if (captchaElem) {
        captchaElem.innerText = code;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    generateCaptcha();
});

// Switch Tabs (Login / Register) - FIXED FUNCTION
function switchForm(formType) {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    const btnLogin = document.getElementById('btn-login-tab');
    const btnReg = document.getElementById('btn-reg-tab');

    if (formType === 'login') {
        if (loginForm) loginForm.classList.remove('hidden');
        if (regForm) regForm.classList.add('hidden');
        if (btnLogin) btnLogin.classList.add('active');
        if (btnReg) btnReg.classList.remove('active');
    } else {
        if (loginForm) loginForm.classList.add('hidden');
        if (regForm) regForm.classList.remove('hidden');
        if (btnReg) btnReg.classList.add('active');
        if (btnLogin) btnLogin.classList.remove('active');
    }
}

// 1. Check for Existing User in Database & Show Terms
function handlePreRegister(e) {
    e.preventDefault();
    const tncModal = document.getElementById('tnc-modal');
    if (tncModal) {
        tncModal.classList.remove('hidden');
    }
}

// 2. Accept Terms & Generate OTP
async function acceptTncAndSendOtp() {
    const tncModal = document.getElementById('tnc-modal');
    if (tncModal) tncModal.classList.add('hidden');

    const email = document.getElementById('reg-email').value.trim();
    const countryCode = document.getElementById('country-code').value;
    const mobile = countryCode + document.getElementById('reg-mobile').value.trim();

    generatedEmailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    generatedMobileOtp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`[OTP DISPATCH] Email OTP: ${generatedEmailOtp}, Mobile OTP: ${generatedMobileOtp}`);
    alert(`Verification OTPs sent to Email (${email}) and Mobile (${mobile}).\n\nFor Testing:\nEmail OTP: ${generatedEmailOtp}\nMobile OTP: ${generatedMobileOtp}`);

    const otpModal = document.getElementById('otp-modal');
    if (otpModal) {
        otpModal.classList.remove('hidden');
    }
}

// 3. Verify Dynamic OTP & Register User
function verifyOtpAndRegister() {
    const emailOtp = document.getElementById('otp-email-input').value.trim();
    const mobileOtp = document.getElementById('otp-mobile-input').value.trim();

    if (emailOtp === generatedEmailOtp && mobileOtp === generatedMobileOtp) {
        alert("Registration Successful! You can now log in.");
        const otpModal = document.getElementById('otp-modal');
        if (otpModal) otpModal.classList.add('hidden');

        generatedEmailOtp = null;
        generatedMobileOtp = null;

        switchForm('login');
    } else {
        alert("Invalid OTP! Please enter the correct verification codes.");
    }
}

// Handle Login Event
function handleLogin(e) {
    e.preventDefault();
    const userCaptchaInput = document.getElementById('captcha-input');
    const captchaCodeElem = document.getElementById('captcha-code');

    if (!userCaptchaInput || !captchaCodeElem) return;

    const userCaptcha = userCaptchaInput.value.trim();
    const realCaptcha = captchaCodeElem.innerText.trim();

    if (userCaptcha.toUpperCase() !== realCaptcha) {
        alert("Invalid Captcha code! Please try again.");
        generateCaptcha();
        return;
    }

    alert("Login Successful!");
}

function showForgotPasswordModal() {
    alert("A password reset link will be sent to your registered email address.");
}