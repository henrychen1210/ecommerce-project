const token = window.localStorage.getItem('token');
const role = window.localStorage.getItem('role');
const isLoggedIn = token !== null;

const productId = window.location.pathname.split('/').filter(Boolean).pop();

document.addEventListener('DOMContentLoaded', async () => {
  const nav = document.getElementById('nav-bar');
  const div = document.getElementById('nav-right');
  const logoutBtn = document.createElement('button');
  const favBtn = document.createElement('button');

  logoutBtn.innerHTML = 'LOGOUT';
  favBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
  logoutBtn.addEventListener('click', logoutUser);

  const homeLink = document.createElement('a');
  homeLink.href = '/';
  homeLink.innerHTML = 'HOME';
  nav.append(homeLink);

  if (isLoggedIn) {
    div.appendChild(logoutBtn);
    div.appendChild(favBtn);
  }
  nav.appendChild(div);

  // Fetch and render product details
  try {
    const res = await fetch(`/api/products/details/${productId}`);
    if (!res.ok) {
      window.location.href = '/404/';
      return;
    }
    const product = await res.json();

    document.title = product.name;
    document.getElementById('productName').textContent = product.name;
    document.getElementById('productPrice').textContent = `$${product.price}`;
    document.getElementById('productMeta').textContent = `${product.type.name} - ${product.brand.name}`;

    const descContainer = document.getElementById('productDesc');
    product.description.split('\n').forEach(line => {
      if (line.trim()) {
        const p = document.createElement('p');
        p.textContent = line.trim();
        descContainer.appendChild(p);
      }
    });

    const img = document.getElementById('productImage');
    img.src = product.image;
    img.alt = product.name;

    if (isLoggedIn) {
      const favorites = await getFavList();
      showFavBtn(product._id, favorites, favBtn);
    }
  } catch (err) {
    console.error('Error loading product:', err.message);
  }
});

const getFavList = async () => {
  try {
    const res = await fetch('/api/favlist', {
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.status === 401) {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('role');
      window.location.href = '/login';
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error('Error getFavList:', err.message);
    return [];
  }
};

const showFavBtn = (id, favorites, favBtn) => {
  const isFavorite = favorites.includes(String(id));
  favBtn.querySelector('i').className = `${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart`;

  const productContainer = document.getElementById('productContainer');
  const wrapper = document.createElement('div');
  wrapper.classList.add('product-card');
  wrapper.appendChild(favBtn);
  productContainer.appendChild(wrapper);

  favBtn.addEventListener('click', async () => {
    const isNowFav = favBtn.querySelector('i').classList.contains('fa-solid');
    if (isNowFav) {
      await unfavoriteProduct(id);
      favBtn.querySelector('i').className = 'fa-regular fa-heart';
    } else {
      await favoriteProduct(id);
      favBtn.querySelector('i').className = 'fa-solid fa-heart';
    }
  });
};

const logoutUser = async () => {
  try {
    await fetch('/api/logout', {
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('role');
    window.location.href = '/';
  } catch (err) {
    console.error('Error logging out:', err.message);
  }
};

const favoriteProduct = async (productId) => {
  try {
    await fetch('/api/favorite', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ productId })
    });
  } catch (err) {
    console.error('Error favoriting:', err.message);
  }
};

const unfavoriteProduct = async (productId) => {
  try {
    await fetch('/api/unfavorite', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ productId })
    });
  } catch (err) {
    console.error('Error unfavoriting:', err.message);
  }
};
