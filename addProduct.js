// Import checkProductExists function and fetchAllProducts function from check.js
import { checkProductExists, fetchAllProducts } from './check.js';

// API Credentials for one user
let url = "https://167.koronacloud.com/web/api/v3/accounts/dd0b749a-56f5-4185-a782-590230a8530f/";
let username = "support";
let password = "support";


// Product Object elements we need
// 'number' is being automatically generated on submission to korona for assurance of not overwriting previous data...still need to figure out how to replace that
// let number;
let products
let prices = document.getElementById('values');
let product_code = document.getElementById('product_code');
let productName = document.getElementById('product_name');
let price_changable = document.getElementById('price_changable');
let discountable = document.getElementById('discountable');
let track_inventory = document.getElementById('track_inventory');
const commodity_group_name = document.getElementById('commodity_group_name');
const assortment_name = document.getElementById('assortment_name');
const sector_name = document.getElementById('sector_name');
const priceGroup = document.getElementById('price-group')
const productSubmitForm = document.getElementById('productForm')
const productInput = document.getElementsByClassName('product-input')
const supplier_name = document.getElementById('supplier_name')
let supplierOrderCode = document.getElementById('orderCode')
let supplierItemCost = document.getElementById('supplier_value')
let supplierPackageQuantity = document.getElementById('containerSize')

// Get other elements from DOM
const supplierSection = document.getElementById('supplier_section')
const toggleSupplierBtn = document.getElementById('toggle_supplier_btn')


let currentDate = new Date().toISOString();
let validFrom = currentDate.slice(0, 19) + "+00:00"; // Format validFrom as "YYYY-MM-DDTHH:MM:SS+00:00"

///////////////////////
// FORM SUBMIT
///////////////////////

const submittedProducts = []; // Array to store submitted products during the current session

const displaySubmittedProducts = (productName, productCode) => {
  // Get the container where you want to display the products
  const productContainer = document.getElementById('submittedProductsList');

  // Create a new list item
  const listItem = document.createElement('li');
  listItem.style.listStyle = 'none';
  listItem.style.textAlign = 'center'

  // Set the text of the list item to the product name and UPC code
  listItem.textContent = `Product Name: ${productName}, UPC Code: ${productCode}`;

  // Add the new list item to the container
  productContainer.appendChild(listItem);
};

const onProductSubmit = async (event) => {
  event.preventDefault();

  const product = [{
    // "number": number,
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
    "priceChangable": price_changable.checked,
    "discountable": discountable.checked,
    "trackInventory": track_inventory.checked,
    "sector": {
        "name": sector_name
    },
    "prices": [
        {
            "value": prices,
            "priceGroup": {
                "name": priceGroup
            },
            "productCode": product_code
        }
    ],
    "supplierPrices": [
        {
            "supplier": {
                "name": supplier_name
            },
            "orderCode": supplierOrderCode,
            "value": supplierItemCost,
            "containerSize": supplierPackageQuantity,
        }
    ]
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
    } else if (option === 'supplier_name') {
      let supplierPrice = product[0].supplierPrices
      supplierPrice[0].supplier.name = selectedValue;
    }
      
  };

    

  getOptionValue('commodity_group_name')
  getOptionValue('assortment_name')
  getOptionValue('sector_name')
  getOptionValue('price-group')    
  getOptionValue('supplier_name')

  console.log(product)

  let requestUrl = url + 'products';
  const submittedProductPrice = product[0].prices[0].value
  const submittedSupplierCost = product[0].supplierPrices[0].value

  // Check if the product exists
  const exists = await checkProductExists(productName, product_code);

  if (exists) {
    alert('Product already exists');
    return;
  }

//TO DO fix supplier item cost <= product price check

  // Check for Supplier Item cost < Product Price
  //if (submittedProductPrice <= submittedSupplierCost) {
  //  alert('Please make sure that Product Price is greater than Supplier Item Cost.');
   // return;
  //}

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
        // Update the displayed submitted products
        displaySubmittedProducts(product[0].name, product[0].codes[0].productCode);

        // Reset form values
        resetForm();

        // Update display with response from server
        showResponseBox();
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

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
const supplierOrderValue = (e) => supplierOrderCode = e.target.value
const supplierCostValue = (e) => supplierItemCost = e.target.value
const supplierPackageValue = (e) => supplierPackageQuantity = e.target.value

///////////////////////////
// TOGGLE SUPPLIERS
//////////////////////////

const toggleSupplierSection = () => {
  const section = document.getElementById('supplier_section');
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
  toggleSupplierBtn.innerText = section.style.display === 'none' ? 'Show' : 'Hide'
}

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

const getSuppliers = () => {
  let requestUrl = url + 'suppliers';
  populateDropdown(requestUrl, supplier_name, 'name', 'name');
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

// *********************
// NOTE: Fix this for actual product number that korona generates on submit   
// *********************
 // Get all products
  // Sort the results by comparing all the lengths of numbers in the array
  // Add the longest number to the variable productNumber
  // Add 1 to the end of Product Number


//////////////////////////
// RESET UI
//////////////////////////
      
const resetForm = () => {
  // Reset input field values
  document.getElementById('product_name').value = '';
  document.getElementById('product_code').value = '';
  document.getElementById('assortment_name').selectedIndex = 0;
  document.getElementById('commodity_group_name').selectedIndex = 0;
  document.getElementById('values').value = '';
  document.getElementById('price-group').selectedIndex = 0;
  document.getElementById('sector_name').selectedIndex = 0;
  document.getElementById('price_changable').checked = true;
  document.getElementById('track_inventory').checked = true;
  document.getElementById('discountable').checked = true;
  // document.getElementById('supplier_number').value = '';
  document.getElementById('supplier_name').selectedIndex = 0;
  document.getElementById('orderCode').value = '';
  document.getElementById('supplier_value').value = '';
  document.getElementById('containerSize').value = '';

  // Hide the supplier_section div
  supplierSection.style.display = 'none';
};

const init = () => {
  productSubmitForm.addEventListener('submit', onProductSubmit);

  prices.addEventListener('input', priceInputValue);
  product_code.addEventListener('input', productCodeValue);
  productName.addEventListener('input', productNameValue);

  supplierOrderCode.addEventListener('input', supplierOrderValue)
  supplierItemCost.addEventListener('input', supplierCostValue)
  supplierPackageQuantity.addEventListener('input', supplierPackageValue)

  getAssortmentNames();
  getSuppliers();
  getCommodityGroups();
  getSectors();
  getPriceGroups();
  //getProducts();
  
  toggleSupplierBtn.addEventListener('click', toggleSupplierSection)

  resetForm();
}

init();
