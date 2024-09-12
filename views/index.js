const BASE_URL = 'http://localhost:3000';

// check if user is logged in
const token = window.localStorage.getItem('token');
const isLoggedIn = token !== null;
let products = [];
let currentPage = 1;
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
  
  nav.appendChild(div);
  parseQueryString();

  data = await fetchProducts(1, selectedBrands, selectedCats);
  const pageLabel = document.getElementById('pageLabel');
  pageLabel.innerHTML = `${currentPage} / ${data.totalPages}`;

  
  checkPages(data.totalPages);

  showProducts(data.products, favorites);

  const searchBtn = document.getElementById('searchBtn');
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

          setCheckboxes();

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

            // Call fetchProducts function with search parameters
            const data = await fetchProducts(1, selectedBrands, selectedCats);
            checkPages(data.totalPages);
            showProducts(data.products, favorites);
          });
      }, 500);
    }
    else{
      searchForm.classList.add('none');
      searchForm.classList.remove('show');
      searchForm.innerHTML = '';
    }
  });
});

function parseQueryString() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  // Get values of selectedCats and selectedBrands from query parameters
  selectedCats = urlParams.has('selectedCats') ? urlParams.get('selectedCats').split(',') : [];
  selectedBrands = urlParams.has('selectedBrands') ? urlParams.get('selectedBrands').split(',') : [];
}

function setCheckboxes() {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  
  checkboxes.forEach(checkbox => {
      if (selectedBrands.includes(checkbox.value) || selectedCats.includes(checkbox.value)) {
          checkbox.checked = true;
      }
  });
}

const showProducts = (products, favorites) => {

  const productsContainer = document.getElementById('products-container');
  // Clear previous content
  productsContainer.innerHTML = '';

  if (products.length == 0) {
    const label = document.createElement('label');
    label.innerHTML = "No product found";
    label.classList.add('noItemLabel');
    productsContainer.appendChild(label);
    checkPages(1, 1);
  }

  // Loop through each product and create a card element to display it
  products.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-card');
    if (isLoggedIn) {
      const isFavorite = favorites.includes(product._id);
      const heartIconClass = isFavorite ? 'fa-solid' : 'fa-regular';

      card.innerHTML = `
        <button class="favItemBtn" data-id="${product._id}">
          <i class="${heartIconClass} fa-heart"></i>
        </button>
        <a href="${BASE_URL}/products/details/${product._id}">
          <img src="${product.image}" alt="${product.name}">
          <label>${product.name}</label>
          <label>$${product.price}</label>
        </a>
      `;
    } else {
      card.innerHTML = `
        <a href="${BASE_URL}/products/details/${product._id}">
          <img src="${product.image}" alt="${product.name}">
          <label>${product.name}</label>
          <label>$${product.price}</label>
        </a>
      `;
    }

    productsContainer.appendChild(card);
  });

  // Add event listeners to favorite buttons
  const favItemBtns = document.querySelectorAll('.favItemBtn');
  favItemBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.getAttribute('data-id');
      const isFavorite = btn.querySelector('i').classList.contains('fa-solid');
      
      if (isFavorite) {
        unfavoriteProduct(productId);
        btn.querySelector('i').classList.remove('fa-solid');
        btn.querySelector('i').classList.add('fa-regular');
      } else {
        favoriteProduct(productId);
        btn.querySelector('i').classList.remove('fa-regular');
        btn.querySelector('i').classList.add('fa-solid');
      }
    });
  });

  
};


const viewProductDetails = (productId) => {
  // Redirect to the product details page with the productId
  window.location.href = `/products/${productId}`;
};

// Function to fetch products
const fetchProducts = async (page, brands, types) => {
  try {
    let url = BASE_URL + `/products?page=${page}`;

    if (brands) {
      brands.forEach((brand) => {
        url += `&brand=${brand}`;
      })
    }
    if (types) {
      types.forEach((type) => {
        url += `&type=${type}`;
      })
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
};

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

const previousBtn = document.getElementById('previousBtn');
const nextBtn = document.getElementById('nextBtn');
const pageLabel = document.getElementById('pageLabel');

// Function to handle next button click
nextBtn.addEventListener('click', async()=> {
  currentPage++;
  const data = await await fetchProducts(currentPage, selectedBrands, selectedCats);
  totalPages = data.totalPages;
  checkPages(totalPages);
  showProducts(data.products, favorites);
  pageLabel.innerHTML = `${currentPage} / ${totalPages}`;
  rollTop();
})

// Function to handle previous button click
previousBtn.addEventListener('click', async()=> {
  currentPage--;
  const data = await await fetchProducts(currentPage, selectedBrands, selectedCats);
  totalPages = data.totalPages;
  checkPages(totalPages);
  showProducts(data.products, favorites);
  pageLabel.innerHTML = `${currentPage} / ${totalPages}`;
  rollTop();
})


function checkPages(totalPages){
  if (currentPage == 1 && currentPage == totalPages){
    previousBtn.disabled = true;
    nextBtn.disabled = true;
  }
  else if(currentPage == 1){
    previousBtn.disabled = true;
    nextBtn.disabled = false;
  }
  else if (currentPage == totalPages) {
    previousBtn.disabled = false;
    nextBtn.disabled = true;
  }
  else {
    previousBtn.disabled = false;
    nextBtn.disabled = false;
  }
}

function rollTop() {
  // Scroll to the top of the page
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // Optional: Add smooth scrolling behavior
  });
}

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

