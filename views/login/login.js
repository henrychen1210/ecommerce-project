const BASE_URL = 'http://localhost:3000';

// check if user is logged in
const token = window.localStorage.getItem('token');
const isLoggedIn = token !== null;

if (isLoggedIn) {
  // if already logged in, redirect to home page
  window.location.href = '/views';
}

// select needed elements
const form = document.getElementsByClassName('login-form')[0];
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

const handleSubmit = async (e) => {
  e.preventDefault();
  const username = DOMPurify.sanitize(usernameInput.value.trim());
  const password = DOMPurify.sanitize(passwordInput.value);

  // Validate username
  if (!isValidUsername(username)) {
    alert('Username must be between 3 and 20 characters and contain only letters and numbers.');
    return;
  }

  try {
    // Send login request to server
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!response.ok) {
      const { message } = await response.json();
      console.error(message);
      alert('Error Logging In: ' + message);
      return;
    }

    const { token, role } = await response.json();

    // Store token and role in localStorage
    window.localStorage.setItem('token', token);
    window.localStorage.setItem('role', role);

    // Redirect based on role
    if (role === 'admin') {
      window.location.href = '/admin'; // Redirect to admin page
    } else {
      window.location.href = '/'; // Redirect to user page
    }
  } catch (error) {
    console.error('Error Logging In:', error.message);
    alert('Error Logging In: ' + error.message);
  }
};

form.addEventListener('submit', handleSubmit);


function isValidUsername(username) {
  const regex = /^[a-zA-Z0-9]{3,20}$/;
  return regex.test(username);
}