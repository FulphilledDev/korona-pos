// Import checkProductExists function and fetchAllProducts function from check.js
import { checkProductExists, fetchAllProducts } from './check.js';

// API Credentials for one user
let url = "https://167.koronacloud.com/web/api/v3/accounts/b281e777-8a54-4ffb-bb1e-19e594454736/";
let username = "main";
let password = "1234";


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
let commodity_group_name = document.getElementById('commodity_group_name');
let assortment_name = document.getElementById('assortment_name');
let sector_name = document.getElementById('sector_name');
let priceGroup = document.getElementById('price-group')
let productSubmitForm = document.getElementById('productForm')
let productInput = document.getElementsByClassName('product-input')
let supplier_name = document.getElementById('supplier_name')
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

  console.log(`Product object: ${product}`)

  const submittedProductPrice = product[0].prices[0].value
  const submittedSupplierCost = product[0].supplierPrices[0].value

  console.log(submittedProductPrice)
  console.log(submittedSupplierCost)
  // TO DO:
 
  // Default for commodity group 'Unassigned'
  // Update a product from one on receipt (grabbing product object) (Must be on receipt BEFORE being able to update)
  // Check if the product exists (name and code)
  const exists = await checkProductExists(product[0].name , product[0].codes[0].productCode);


  if (document.getElementById('product_name').value === '' ||
    document.getElementById('product_code').value === '' ||
    document.getElementById('values').value === '' ||
    document.getElementById('orderCode').value === '' ||
    document.getElementById('supplier_value').value === '' ||
    document.getElementById('containerSize').value === '') {

      const alertBox = document.getElementById('alert-box');
      alertBox.innerText = "Please fill in all appropriate fields.";

      // Apply CSS styles
      alertBox.style.backgroundColor = "red";
      alertBox.style.color = "white";
      alertBox.style.fontWeight = "700";
      alertBox.style.textAlign = "center";

      // Scroll to the 'serverResponse' element
      const serverResponseElement = document.getElementById('serverResponse');
      serverResponseElement.scrollIntoView({ behavior: 'smooth' });

      return;
  } else if (exists) {
    alert('Product already exists');
    return;
  } else if (submittedProductPrice < submittedSupplierCost) {
    alert('Please make sure that Product Price is greater than Supplier Item Cost.')
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

  // Reset product variables
  productName = document.getElementById('product_name').value;
  product_code = document.getElementById('product_code').value;
  assortment_name = document.getElementById('assortment_name').value;
  commodity_group_name = document.getElementById('commodity_group_name').value;
  prices = document.getElementById('values').value;
  priceGroup = document.getElementById('price-group').value;
  sector_name = document.getElementById('sector_name').value;
  price_changable = document.getElementById('price_changable').checked;
  track_inventory = document.getElementById('track_inventory').checked;
  discountable = document.getElementById('discountable').checked;
  supplier_name = document.getElementById('supplier_name').value;
  supplierOrderCode = document.getElementById('orderCode').value;
  supplierItemCost = document.getElementById('supplier_value').value;
  supplierPackageQuantity = document.getElementById('containerSize').value;

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
};

init()
