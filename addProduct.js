// Import checkProductExists function and fetchAllProducts function from check.js
import { checkProductExists, fetchAllProducts } from './check.js';

// API Credentials for one user
let url = "https://167.koronacloud.com/web/api/v3/accounts/b281e777-8a54-4ffb-bb1e-19e594454736/";
let username = "support";
let password = "support";


// Product Object elements we need
// 'number' is being automatically generated on submission to korona for assurance of not overwriting previous data...still need to figure out how to replace that
// let number;
let products
let prices = document.getElementById('values');
let product_code = document.getElementById('product_code');
let productName = document.getElementById('product_name');
let commodity_group_name = document.getElementById('commodity_group_name');
let assortment_name = document.getElementById('assortment_name');
let sector_name = document.getElementById('sector_name');
let priceGroup = document.getElementById('price-group')
let productSubmitForm = document.getElementById('productForm')
let productInput = document.getElementsByClassName('product-input')
// let supplier_name = document.getElementById('supplier_name')
// let supplierOrderCode = document.getElementById('orderCode')
// let supplierItemCost = document.getElementById('supplier_value')
// let supplierPackageQuantity = document.getElementById('containerSize')

let price_changable = false;
let discountable = false;
let track_inventory = false;

function updateCheckboxValues() {
  price_changable = document.getElementById('price_changable').checked;
  discountable = document.getElementById('discountable').checked;
  track_inventory = document.getElementById('track_inventory').checked;
}


let currentDate = new Date().toISOString();
let validFrom = currentDate.slice(0, 19) + "+00:00"; // Format validFrom as "YYYY-MM-DDTHH:MM:SS+00:00"

///////////////////////
// FORM SUBMIT
///////////////////////

// Submitted Product Information Table
const submittedProducts = []; // Array to store submitted products during the current session

const displaySubmittedProducts = (productName, productCode, productSector, commGroup, productPrice) => {
  // Get the container where you want to display the products
  const productContainer = document.getElementById('submittedProductsList');

  // Create a new table element
  const table = document.createElement('table');
  table.style.textAlign = 'center';
  table.style.margin = 'auto';
  table.style.width = '350px'

  // Create table rows for each parameter
  const parameters = [
    { name: 'Product Name', value: productName },
    { name: 'UPC Code', value: productCode },
    { name: 'Product Sector', value: productSector },
    { name: 'Commodity Group', value: commGroup },
    { name: 'Product Price', value: productPrice }
  ];

  parameters.forEach(parameter => {
    // Create a table row
    const row = document.createElement('tr');

    // Create the left column for parameter name
    const nameColumn = document.createElement('td');
    nameColumn.textContent = parameter.name;
    nameColumn.className = 'nameColumn'
    nameColumn.padding = '0 10px'

    // Create the right column for parameter value
    const valueColumn = document.createElement('td');
    valueColumn.textContent = parameter.value;
    valueColumn.padding = '0 10px'

    // Add the columns to the row
    row.appendChild(nameColumn);
    row.appendChild(valueColumn);

    // Add the row to the table
    table.appendChild(row);
  });

  // Add the table to the container
  productContainer.appendChild(table);
};

// Submit Product
const onProductSubmit = async (event) => {
  event.preventDefault();

  const spinner = document.querySelector('.spinner');
  spinner.style.display = 'block';

  const product = [{
    "assortment": {
        "name": assortment_name,
    },
    "codes": [{
        "productCode": product_code,
    }],
    "commodityGroup": {
        "name": commodity_group_name,
    },
    "name": productName,
    "priceChangable": price_changable,
    "discountable": discountable,
    "trackInventory": track_inventory,
    "sector": {
        "name": sector_name
    },
    "prices": [
        {
            "value": prices,
            "priceGroup": {
                "name": priceGroup
            },
            "validFrom": validFrom
        }
    ],
  }];

  const getOptionValue = (option) => {
    const selectElement = document.getElementById(option);
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const selectedValue = selectedOption.value;

    // // Assign the selected value to the name property
    if (option === 'commodity_group_name') {
      product[0].commodityGroup.name = selectedValue;
    } else if (option === 'sector_name') {
      product[0].sector.name = selectedValue;
    } else if (option === 'assortment_name') {
      product[0].assortment.name = selectedValue;
    } else if (option === 'price-group') {
      let productPrice = product[0].prices
      productPrice[0].priceGroup.name = selectedValue;
    } 
      
  };
  
  getOptionValue('commodity_group_name')
  getOptionValue('assortment_name')
  getOptionValue('sector_name')
  getOptionValue('price-group')    

  updateCheckboxValues()

  console.log(`Product object: ${product}`)
 
  // Default for commodity group 'Unassigned'
  // Update a product from one on receipt (grabbing product object) (Must be on receipt BEFORE being able to update)
  // Check if the product exists (name and code)
  const exists = await checkProductExists(product[0].name , product[0].codes[0].productCode);


  if (document.getElementById('product_name').value === '' ||
    document.getElementById('product_code').value === '' ||
    document.getElementById('values').value === ''
    ) {

      const alertBox = document.getElementById('alert-box');
      alertBox.innerText = "Please fill in all appropriate fields.";

      // Apply CSS styles
      alertBox.style.backgroundColor = "red";
      alertBox.style.color = "white";
      alertBox.style.fontWeight = "700";
      alertBox.style.textAlign = "center";

      // Remove alertBox after 5 seconds
      setTimeout(() => {
        alertBox.innerText = "";
        alertBox.style.backgroundColor = "";
        alertBox.style.color = "";
        alertBox.style.fontWeight = "";
        alertBox.style.textAlign = "";
      }, 5000);

      return;
  } else if (exists) {
    alert('Product already exists');
    return;
  } else {
    let requestUrl = url + 'products';

    fetch(requestUrl, {
      method: 'POST',
      body: JSON.stringify(product),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(username + ":" + password)
      },
    })
    .then(response => response.text())
    .then(data => {

      console.log(data)
      const responseData = JSON.parse(data)
      console.log(responseData)
      const serverResponse = document.getElementById('serverResponse').innerText = "Response from server: " + responseData[0].action;
    
    
      if (serverResponse.includes('ADDED')) {
        // Display the submitted product
        displaySubmittedProducts(product[0].name, product[0].codes[0].productCode, product[0].sector.name, product[0].commodityGroup.name, product[0].prices[0].value);

        // Reset form values
        resetForm();

        // Update display with response from server
        showResponseBox();
      }

      spinner.style.display = 'none';
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  }
 
    
  }

const showResponseBox = () => {
  const responseBox = document.querySelector('.response-box');
  responseBox.style.display = 'block';
};

////////////////////////////
// FORM VALUES
///////////////////////////

const priceInputValue = (e) => prices = e.target.value;
const productCodeValue = (e) => product_code = e.target.value;
const productNameValue = (e) => productName = e.target.value;

////////////////////////
// INIT FUNCTIONS
////////////////////////

// Create Reusable Dropdown for Supplier, Assortments, Commodity Group, and Sector Name Options
const populateDropdown = (requestUrl, selectElement, optionValue, optionText, maxHeight) => {

  fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(username + ':' + password),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      data.results.sort((a, b) => a.name.localeCompare(b.name));

      // Check if 'General' and 'Default' exist in data.results
      const hasGeneral = data.results.some((item) => item[optionText] === 'General');
      const hasDefault = data.results.some((item) => item[optionText] === 'Default');
      const hasGeneralAssortment = data.results.some((item) => item[optionText] === 'General Assortment')
      const hasMisc = data.results.some((item) => item[optionText] === 'Misc');


      // Clear any existing options
      $(selectElement).empty();

      // Add 'General' and 'Default' options if not already present
      data.results.forEach((item) => {
        const option = new Option(item[optionText], item[optionValue]);
        
        // Set selected option to 'General' or 'Default' if it exists in data.results
        if (item[optionText] === 'General' && hasGeneral) {
          $(option).prop('selected', true);
        } else if (item[optionText] === 'Default' && hasDefault) {
          $(option).prop('selected', true);
        } else if (item[optionText] === 'General Assortment' && hasGeneralAssortment) {
          $(option).prop('selected', true);
        } else if (item[optionText] === 'Misc' && hasMisc) {
          $(option).prop('selected', true);
        }
        
        $(selectElement).append(option);
      });

      // Initialize Select2 on the select element
      $(selectElement).select2({
        maximumSelectionSize: 500,
        dropdownAutoWidth: true,
        theme: "classic",
        class: "resolve"
      });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

const getAssortmentNames = () => {
  let requestUrl = url + 'assortments';
  populateDropdown(requestUrl, assortment_name, 'name', 'name');
};

const getCommodityGroups = () => {
  let requestUrl = url + 'commodityGroups';
  populateDropdown(requestUrl, commodity_group_name, 'name', 'name');
};

const getSectors = () => {
  let requestUrl = url + 'sectors';
  populateDropdown(requestUrl, sector_name, 'name', 'name');
};

const getPriceGroups = () => {
  let requestUrl = url + 'priceGroups';
  populateDropdown(requestUrl, priceGroup, 'name', 'name');
};

//////////////////////////
// RESET UI
//////////////////////////
      
const resetForm = () => {
  // Reset input field values
  document.getElementById('product_name').value = '';
  document.getElementById('product_code').value = '';
  document.getElementById('values').value = '';
  document.getElementById('price_changable').checked = true;
  document.getElementById('track_inventory').checked = true;
  document.getElementById('discountable').checked = true;

  // Reset product variables
  productName = document.getElementById('product_name').value;
  product_code = document.getElementById('product_code').value;
  assortment_name = '';
  commodity_group_name = '';
  sector_name = '';
  prices = document.getElementById('values').value;
  priceGroup = document.getElementById('price-group').value;
  price_changable = document.getElementById('price_changable').checked;
  track_inventory = document.getElementById('track_inventory').checked;
  discountable = document.getElementById('discountable').checked;

  // Call Get Functions for dropdown menus to reset values to 'Misc', 'General', etc
  getAssortmentNames();
  getCommodityGroups();
  getSectors();
  getPriceGroups();
};

const init = () => {
  productSubmitForm.addEventListener('submit', onProductSubmit);

  prices.addEventListener('input', priceInputValue);
  product_code.addEventListener('input', productCodeValue);
  productName.addEventListener('input', productNameValue);

  document.getElementById('price_changable').addEventListener('change', updateCheckboxValues);
  document.getElementById('discountable').addEventListener('change', updateCheckboxValues);
  document.getElementById('track_inventory').addEventListener('change', updateCheckboxValues);

  getAssortmentNames();
  getCommodityGroups();
  getSectors();
  getPriceGroups();


  resetForm();
};

init()