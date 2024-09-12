const BASE_URL = 'http://localhost:3000';

const token = window.localStorage.getItem('token');
const role = window.localStorage.getItem('role');
const isLoggedIn = token !== null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!isLoggedIn || role !=='admin') {
    window.location.href = '/404/';
    return;
  }


  const nav = document.getElementById('nav-bar');
  const div = document.getElementById('nav-right');
  const logoutBtn = document.createElement('button');


  logoutBtn.innerHTML = 'LOGOUT';
  logoutBtn.addEventListener('click', () => logoutUser());
  div.appendChild(logoutBtn);
  nav.appendChild(div);

  const users = await getUserList();
  showUsers(users);
});

const getUserList = async () => {
  try {
    const response = await fetch(BASE_URL + '/admin/user', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error getUserList:', error.message);
    throw error;
  }
};

// Function to log out a user
const logoutUser = async () => {
  try {
    const response = await fetch(BASE_URL + '/logout', {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Authorization': `Bearer ${token}` // Include the token in the Authorization header
      }
    });
    const data = await response.json();
    console.log(data);

    window.localStorage.removeItem('token');
    window.localStorage.removeItem('role');
    window.location.href = '/';

    return data;
  } catch (error) {
    console.error('Error logging out user:', error.message);
    throw error;
  }
};


function showUsers(users) {
  const userTable = document.getElementById('userTable');


  users.forEach(user => {
    if (user.role === 'admin') 
      return;

    const tr = document.createElement('tr');
    const td_username = document.createElement('td');
    const td_email = document.createElement('td');
    const td_btn = document.createElement('td');
    const showFavListBtn = document.createElement('button');
    
    
    td_username.innerHTML = `<label>${user.username}</label>`;
    td_email.innerHTML = `<label>${user.email}</label>`;
    showFavListBtn.innerHTML = 'show';
    showFavListBtn.addEventListener('click', () => showFavProduct(user.favorites));

    td_btn.appendChild(showFavListBtn);
    tr.appendChild(td_username);
    tr.appendChild(td_email);
    tr.appendChild(td_btn);

    userTable.appendChild(tr);
  });
}

async function showFavProduct(favorites) {
  const prodcutContainer = document.getElementById('prodcutContainer');
  prodcutContainer.innerHTML = "";

  for (const fav of favorites) {
    try {
      const productInfo = await fetchProductImage(fav);
      const card = document.createElement('div');
      card.classList.add('product-card');
      card.innerHTML = `
        <a href="${BASE_URL}/products/details/${productInfo._id}">
          <img src="${productInfo.image}" alt="${productInfo.name}">
        </a>
      `;
      prodcutContainer.appendChild(card);
    } catch (error) {
      console.error('Error fetching product details:', error.message);
    }
  }
}

const fetchProductImage = async (productId) => {
  try {
    const response = await fetch(`${BASE_URL}/products/image?productId=${productId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching product details:', error.message);
    throw error;
  }
};
