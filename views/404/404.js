const BASE_URL = 'http://localhost:3000';

// check if user is logged in
const token = window.localStorage.getItem('token');
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

  link_sign.innerHTML = "Sing Up";
  link_log.innerHTML = "Login";
  logoutBtn.innerHTML = 'Logout'
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
  }
  
  nav.appendChild(div);


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
});