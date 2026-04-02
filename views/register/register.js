const BASE_URL = '';

// check if user is logged in
const token = window.localStorage.getItem('token');
const isLoggedIn = token !== null;

if (isLoggedIn) {
  // if already logged in, redirect to home page
  window.location.href = '/views';
}

// select needed elements
const form = document.getElementById('signup-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');

const handleSubmit = async (e) => {
  e.preventDefault();
  const username = DOMPurify.sanitize(usernameInput.value.trim());
  const email = DOMPurify.sanitize(emailInput.value.trim());
  const password = DOMPurify.sanitize(passwordInput.value);
  const confirmPassword = confirmPasswordInput.value;

  // Validate username
  if (!isValidUsername(username)) {
    alert('Username must be between 3 and 20 characters and contain only letters and numbers.');
    return;
  }

  // Validate email
  if (!isValidEmail(email)) {
    alert('Invalid email format.');
    return;
  }

  // Validate password
  if (!isValidPassword(password)) {
    alert('Password must be between 6 and 20 characters and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.');
    return;
  }

  // Confirm password
  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        email,
        role: "user"
      }),
    });

    if (!res.ok) {
      const { message } = await res.json();
      console.error(message);
      alert('Error Registering: ' + message);
      return;
    }

    const { token } = await res.json();
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('role', 'user');
    window.location.href = '/';
  } catch (err) {
    console.error('Error Registering:', err.message);
    alert('Error Registering: ' + err.message);
  }
};

form.addEventListener('submit', handleSubmit);


function isValidUsername(username) {
  const regex = /^[a-zA-Z0-9]{3,20}$/;
  return regex.test(username);
}

function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function isValidPassword(password) {
  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{":;'?/>.<,])(?=.*[^\s]).{6,20}$/;
  return regex.test(password);
}
