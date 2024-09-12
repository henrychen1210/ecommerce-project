const BASE_URL = 'http://localhost:3000';

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

const handleSubmit = (e) => {
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

  fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      // must specify content-type if you used express.urlencoded() middleware
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
      email,
      role: "user"
    }),
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then(({ message }) => {
          console.error(message);
          alert('Error Logging In: ' + message);
        });
      }
      return res.json();
    })
    .then(({ token }) => {
      // after signup, set the token and username to the localStorage, you don't have to set the username in localStorage, it is just for display purposes
      window.localStorage.setItem('token', token);
      window.localStorage.setItem('role', 'user');
    })
    .then(() => (window.location.href = '/')) // after setting everything in localStorage, redirect to home page
    .catch((err) => {
      console.log(err.message);
    });
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
