

// Function to register a new user
const registerUser = async (userData) => {
  try {
    const response = await fetch('/api/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error registering user:', error.message);
    throw error;
  }
};

// Function to log in a user
const loginUser = async (userData) => {
  try {
    const response = await fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error logging in user:', error.message);
    throw error;
  }
};

// Function to log out a user
const logoutUser = async () => {
  try {
    const response = await fetch('/api/user/logout', {
      method: 'GET',
      credentials: 'include' // Include cookies in the request
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error logging out user:', error.message);
    throw error;
  }
};

// Function to fetch products
const fetchProducts = async (page, brand, type) => {
  try {
    let url = `/api/products?page=${page}`;
    if (brand) {
      url += `&brand=${brand}`;
    }
    if (type) {
      url += `&type=${type}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching products:', error.message);
    throw error;
  }
};

// Function to fetch product details
const fetchProductDetails = async (productId) => {
  try {
    const response = await fetch(`/api/products/details/${productId}`);
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching product details:', error.message);
    throw error;
  }
};

// Function to favorite a product
const favoriteProduct = async (userId, productId) => {
  try {
    const response = await fetch('/api/user/favorite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, productId })
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error favoriting product:', error.message);
    throw error;
  }
};

// Function to unfavorite a product
const unfavoriteProduct = async (userId, productId) => {
  try {
    const response = await fetch('/api/user/unfavorite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, productId })
    });
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error unfavoriting product:', error.message);
    throw error;
  }
};
