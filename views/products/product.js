const BASE_URL = 'http://localhost:3000';

// check if user is logged in
const token = window.localStorage.getItem('token');
const role = window.localStorage.getItem('role');
const isLoggedIn = token !== null;
let products = [];
let selectedCats = [];
let selectedBrands = [];
let favorites = [];

document.addEventListener('DOMContentLoaded', async () => {
  const nav = document.getElementById('nav-bar');
  const div = document.getElementById('nav-right');
  const link_sign = document.createElement('a');
  const link_log = document.createElement('a');
  const favBtn = document.createElement('button');
  const logoutBtn = document.createElement('button');

  link_sign.innerHTML = "REGISTER";
  link_log.innerHTML = "LOGIN";
  logoutBtn.innerHTML = 'LOGOUT'
  favBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';

  link_sign.href = "/register";
  link_log.href = "/login";

  logoutBtn.addEventListener('click', () => logoutUser());

  favBtn.addEventListener('click', async ()=> {
    favorites = await getFavList();
    showFavList(favorites);
  });

  if (!isLoggedIn){
    div.appendChild(link_sign);
    div.appendChild(link_log);
  }
  else{
    div.appendChild(logoutBtn);
    div.appendChild(favBtn);
    favorites = await getFavList();
  }
  const searchBtn = document.getElementById('searchBtn');

  if (role === 'admin') {
    const a = document.createElement('a');
    a.href = '/admin';
    a.innerHTML = "BACK";
    nav.append(a);
    nav.appendChild(div);
    searchBtn.style.display = 'none';
    favBtn.style.display = 'none';
    return;
  }
  else{
    const a = document.createElement('a');
    a.href = '/';
    a.innerHTML = 'HOME';
    nav.append(a);
    nav.appendChild(div);
  }

  
  const searchForm = document.getElementById('searchForm');
  searchForm.classList.add('none');
  searchBtn.addEventListener('click', () => {
    if (searchForm.classList.contains('none')){
      searchForm.classList.add('show');
      searchForm.classList.remove('none');

      setTimeout(() => {
        searchForm.innerHTML += (`
          <div class="checkbox-container">
            <label for="brand" class='bold'> Brand </label>
            <label for="brand1">
              <input type="checkbox" id="brand1" name="Aime Leon Dore" value="Aime Leon Dore" />
              <span class="custom-checkbox"></span>
              &nbsp;Aime Leon Dore
            </label>
            
            <label for="brand2">
              <input type="checkbox" id="brand2" name="Noah" value="Noah" />
              <span class="custom-checkbox"></span>
              &nbsp;Noah
            </label>

            
            <label for="brand3">
              <input type="checkbox" id="brand3" name="Stussy" value="Stussy" />
              <span class="custom-checkbox"></span>
              &nbsp;Stussy
            </label>

            
            <label for="brand4">
              <input type="checkbox" id="brand4" name="Supreme" value="Supreme" />
              <span class="custom-checkbox"></span>
              &nbsp;Supreme
            </label>

            
            <label for="brand5">
              <input type="checkbox" id="brand5" name="Pilgrim surf supply" value="Pilgrim surf supply" />
              <span class="custom-checkbox"></span>
              &nbsp;Pilgrim surf supply
            </label>
            <br>
            <label for="cat" class='bold'> Catagory </label>
            
            <label for="cat1">
              <input type="checkbox" id="cat1" name="Accessory" value="Accessory" />
              <span class="custom-checkbox"></span>
              &nbsp;Accessory
            </label>

            
            <label for="cat2">
              <input type="checkbox" id="cat2" name="Top" value="Top" />
              <span class="custom-checkbox"></span>
              &nbsp;Top
            </label>

            
            <label for="cat3">
              <input type="checkbox" id="cat3" name="Bottom" value="Bottom"></input>
              <span class="custom-checkbox"></span>
              &nbsp;Bottom
            </label>

            <label>
              <button type='submit' id='applyBtn'> apply </button>
            </label>
            
          </div>`);

          applyBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Prevent default form submission
            const selectedCheckboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).slice(0, 5);
            selectedBrands = selectedCheckboxes
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);

            const selectedCheckboxes1 = Array.from(document.querySelectorAll('input[type="checkbox"]')).slice(5);
            selectedCats = selectedCheckboxes1
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);

            const queryString = new URLSearchParams({
                  selectedCats: selectedCats.join(','), // Join selected categories with comma
                  selectedBrands: selectedBrands.join(',') // Join selected brands with comma
            });

            window.location.href = `/?${queryString.toString()}`;
          });
      }, 500);
    }
    else{
      searchForm.classList.add('none');
      searchForm.classList.remove('show');
      searchForm.innerHTML = '';
    }
  });

  const parts = window.location.href.split('/');
  const productId = parts[parts.length - 1];

  showFavBtn(productId, favorites);
  
});

const getFavList = async () => {
  try {
    const response = await fetch(BASE_URL + '/favlist', {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      alert('Token is expired, please login again.');
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('role');
      window.location.href = '/login';
      return;
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error getFavList:', error.message);
    throw error;
  }
};

const showFavList = (favorites, show) => {
  const div = document.getElementById('favList');

  div.classList.toggle('show-fav-list', show);

  if (div.innerHTML && !show) {
    div.innerHTML = ""
  }
  else {
    div.innerHTML = ""
    favorites.forEach( async (id) => {
      const productInfo = await fetchProductImage(id);
      const card = document.createElement('div');
      card.classList.add('product-card');
      card.innerHTML = `
        <a href="${BASE_URL}/products/details/${productInfo._id}">
          <img src="${productInfo.image}" alt="${productInfo.name}">
        </a>
      `;
      div.appendChild(card);
      
    });
  }
}

// Function to fetch product details
const fetchProductImage = async (productId) => {
  try {
    const response = await fetch( BASE_URL + `/products/image?productId=${productId}`, {
      method: 'GET',
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching product details:', error.message);
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

const showFavBtn = (product, favorites) => {

  const productContainer = document.getElementById('productContainer');
  const card = document.createElement('div');
  card.classList.add('product-card');
  if (isLoggedIn) {
    const isFavorite = favorites.includes(product);
    const heartIconClass = isFavorite ? 'fa-solid' : 'fa-regular';

    card.innerHTML = `
      <button class="favItemBtn" data-id="${product}">
        <i class="${heartIconClass} fa-heart"></i>
      </button>
    `;
  } else {
    card.innerHTML = '';
  }

  productContainer.appendChild(card);

  // Add event listeners to favorite buttons
  const favItemBtn = document.getElementsByClassName('favItemBtn')[0];

  favItemBtn.addEventListener('click', () => {
    const productId = favItemBtn.getAttribute('data-id');
    const isFavorite = favItemBtn.querySelector('i').classList.contains('fa-solid');
    
    if (isFavorite) {
      unfavoriteProduct(productId);
      favItemBtn.querySelector('i').classList.remove('fa-solid');
      favItemBtn.querySelector('i').classList.add('fa-regular');
    } else {
      favoriteProduct(productId);
      favItemBtn.querySelector('i').classList.remove('fa-regular');
      favItemBtn.querySelector('i').classList.add('fa-solid');
    }
  });
};

// Function to favorite a product
const favoriteProduct = async (productId) => {
  try {
    const response = await fetch( BASE_URL + '/favorite', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });
    const data = await response.json();
    console.log(data);
    favorites = await getFavList();
    showFavList(favorites, true);
    return data;
  } catch (error) {
    console.error('Error favoriting product:', error.message);
    throw error;
  }
};

// Function to unfavorite a product
const unfavoriteProduct = async (productId) => {
  try {
    const response = await fetch( BASE_URL + '/unfavorite', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });
    const data = await response.json();
    console.log(data);
    favorites = await getFavList();
    showFavList(favorites, true);
    return data;
  } catch (error) {
    console.error('Error unfavorite product:', error.message);
    throw error;
  }
};
