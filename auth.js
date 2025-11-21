// Authentication System
const authModal = document.getElementById('auth-modal');
const mainContainer = document.getElementById('main-container');
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const signupConfirm = document.getElementById('signup-confirm');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const authTabs = document.querySelectorAll('.auth-tab');

// EmailJS Configuration
// To set up EmailJS:
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Create an email service (Gmail, Outlook, etc.)
// 3. Create an email template
// 4. Get your Public Key, Service ID, and Template ID
// 5. Update the values below

const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'YOUR_PUBLIC_KEY', // Replace with your EmailJS Public Key
    SERVICE_ID: 'YOUR_SERVICE_ID', // Replace with your EmailJS Service ID
    TEMPLATE_ID: 'YOUR_TEMPLATE_ID' // Replace with your EmailJS Template ID
};

// Initialize EmailJS
function initEmailJS() {
    if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        return true;
    }
    return false;
}

// Send welcome email after signup
async function sendWelcomeEmail(userEmail) {
    // Check if EmailJS is configured
    if (!initEmailJS()) {
        console.log('EmailJS not configured. Skipping email send.');
        return { success: false, message: 'Email service not configured' };
    }

    try {
        const templateParams = {
            to_email: userEmail,
            to_name: userEmail.split('@')[0], // Use part before @ as name
            from_name: 'Meme Generator Team',
            subject: 'Welcome to Meme Generator!',
            message: `Welcome to Meme Generator! We're excited to have you on board. Start creating amazing memes today!`,
            reply_to: userEmail
        };

        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams
        );

        console.log('Welcome email sent successfully!', response);
        return { success: true, message: 'Welcome email sent successfully!' };
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        return { success: false, message: 'Failed to send welcome email: ' + error.text };
    }
}

// Check if user is already logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        showMainApp();
    } else {
        // Pre-fill email if remembered
        const lastEmail = localStorage.getItem('lastEmail');
        if (lastEmail) {
            if (signupEmail) signupEmail.value = lastEmail;
            if (loginEmail) loginEmail.value = lastEmail;
        }
        showAuthModal();
    }
}

// Show authentication modal
function showAuthModal() {
    authModal.style.display = 'flex';
    mainContainer.style.display = 'none';
}

// Show main application
function showMainApp() {
    authModal.style.display = 'none';
    mainContainer.style.display = 'block';
}

// Password validation
function validatePassword(password) {
    const requirements = {
        length: password.length >= 12,
        capital: /[A-Z]/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    return requirements;
}

// Update password requirement indicators
function updatePasswordRequirements(password) {
    const requirements = validatePassword(password);
    
    const lengthEl = document.getElementById('req-length');
    const capitalEl = document.getElementById('req-capital');
    const specialEl = document.getElementById('req-special');
    
    if (requirements.length) {
        lengthEl.classList.add('valid');
        lengthEl.classList.remove('invalid');
    } else {
        lengthEl.classList.add('invalid');
        lengthEl.classList.remove('valid');
    }
    
    if (requirements.capital) {
        capitalEl.classList.add('valid');
        capitalEl.classList.remove('invalid');
    } else {
        capitalEl.classList.add('invalid');
        capitalEl.classList.remove('valid');
    }
    
    if (requirements.special) {
        specialEl.classList.add('valid');
        specialEl.classList.remove('invalid');
    } else {
        specialEl.classList.add('invalid');
        specialEl.classList.remove('valid');
    }
    
    return requirements.length && requirements.capital && requirements.special;
}

// Tab switching
authTabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const targetTab = this.dataset.tab;
        
        // Update active tab
        authTabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // Show/hide forms
        if (targetTab === 'signup') {
            signupForm.classList.add('active');
            loginForm.classList.remove('active');
        } else {
            signupForm.classList.remove('active');
            loginForm.classList.add('active');
        }
        
        // Clear forms
        signupForm.reset();
        loginForm.reset();
        document.getElementById('signup-error').style.display = 'none';
        document.getElementById('login-error').style.display = 'none';
        document.getElementById('password-match').style.display = 'none';
        
        // Clear password requirements
        ['req-length', 'req-capital', 'req-special'].forEach(id => {
            document.getElementById(id).classList.remove('valid', 'invalid');
        });
    });
});

// Password input validation
signupPassword.addEventListener('input', function() {
    updatePasswordRequirements(this.value);
    
    // Check password match if confirm field has value
    if (signupConfirm.value) {
        if (this.value !== signupConfirm.value) {
            document.getElementById('password-match').style.display = 'block';
        } else {
            document.getElementById('password-match').style.display = 'none';
        }
    }
});

signupConfirm.addEventListener('input', function() {
    if (signupPassword.value !== this.value) {
        document.getElementById('password-match').style.display = 'block';
    } else {
        document.getElementById('password-match').style.display = 'none';
    }
});

// Sign up form submission
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = signupEmail.value.trim();
    const password = signupPassword.value;
    const confirm = signupConfirm.value;
    const errorEl = document.getElementById('signup-error');
    
    // Validate password
    const requirements = validatePassword(password);
    if (!requirements.length || !requirements.capital || !requirements.special) {
        errorEl.textContent = 'Password does not meet all requirements';
        errorEl.style.display = 'block';
        return;
    }
    
    // Check password match
    if (password !== confirm) {
        errorEl.textContent = 'Passwords do not match';
        errorEl.style.display = 'block';
        return;
    }
    
    // Check if email already exists
    const accounts = JSON.parse(localStorage.getItem('accounts') || '{}');
    if (accounts[email]) {
        errorEl.textContent = 'An account with this email already exists';
        errorEl.style.display = 'block';
        return;
    }
    
    // Create account (in a real app, you'd hash the password)
    accounts[email] = {
        email: email,
        password: password, // In production, this should be hashed!
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('accounts', JSON.stringify(accounts));
    localStorage.setItem('currentUser', email);
    localStorage.setItem('lastEmail', email);
    
    // Show success message
    errorEl.textContent = '';
    errorEl.style.display = 'none';
    
    // Show loading state
    const submitBtn = signupForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending welcome email...</span>';
    
    // Send welcome email
    const emailResult = await sendWelcomeEmail(email);
    
    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
    
    // Show success message
    if (emailResult.success) {
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.textContent = 'Account created! Welcome email sent.';
        successMsg.style.display = 'block';
        signupForm.appendChild(successMsg);
        
        setTimeout(() => {
            showMainApp();
        }, 1500);
    } else {
        // Still show app even if email fails
        const warningMsg = document.createElement('div');
        warningMsg.className = 'warning-message';
        warningMsg.textContent = 'Account created! (Email service not configured)';
        warningMsg.style.display = 'block';
        signupForm.appendChild(warningMsg);
        
        setTimeout(() => {
            showMainApp();
        }, 1500);
    }
});

// Login form submission
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    const errorEl = document.getElementById('login-error');
    
    // Get accounts
    const accounts = JSON.parse(localStorage.getItem('accounts') || '{}');
    
    // Check if account exists
    if (!accounts[email]) {
        errorEl.textContent = 'No account found with this email';
        errorEl.style.display = 'block';
        return;
    }
    
    // Check password
    if (accounts[email].password !== password) {
        errorEl.textContent = 'Incorrect password';
        errorEl.style.display = 'block';
        return;
    }
    
    // Login successful
    localStorage.setItem('currentUser', email);
    localStorage.setItem('lastEmail', email);
    errorEl.textContent = '';
    errorEl.style.display = 'none';
    showMainApp();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

