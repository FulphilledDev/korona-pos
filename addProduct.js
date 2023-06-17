// API Credentials for one user
const url = "https://167.koronacloud.com/web/api/v3/accounts/b281e777-8a54-4ffb-bb1e-19e594454736/";
const username = "main";
const password = "1234";

// Product Object elements we need
// 'number' is being automatically generated on submission to korona for assurance of not overwriting previous data...still need to figure out how to replace that
// let number;
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

// Get other elements from DOM
const supplierSection = document.getElementById('supplier_section')
const toggleSupplierBtn = document.getElementById('toggle_supplier_btn')
const getCommodityGroupsBtn = document.getElementById('getCommodityGroupsBtn')
const getSuppliersBtn = document.getElementById('getSuppliersBtn')
const getSectorsBtn = document.getElementById('getSectorsBtn')

let currentDate = new Date().toISOString();
let validFrom = currentDate.slice(0, 19) + "+00:00"; // Format validFrom as "YYYY-MM-DDTHH:MM:SS+00:00"

///////////////////////
// FORM ACTIONS
///////////////////////

// SUBMIT
const onProductSubmit = (event) => {
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
      // "supplierPrices": [
      //     {
      //         "supplier": {
      //             "name": document.getElementById('supplier_name').value
      //         },
      //         "orderCode": document.getElementById('orderCode').value,
      //         "value": parseFloat(document.getElementById('supplier_value').value),
      //         "containerSize": parseFloat(document.getElementById('containerSize').value),
      //         // "description": document.getElementById('supplier_description').value
      //     }
      // ]
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

    console.log(product)
    console.log(`New product name: ${productName}`)
    console.log(price_changable.checked)
    console.log(track_inventory.checked)
    console.log(discountable.checked)

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

        const serverResponse = document.getElementById('serverResponse').innerText = "Response from server: " + data;

        if (serverResponse.includes('ADDED')) {
          resetForm();
        }

        
    })
    .catch((error) => {
        console.error('Error:', error);
    })
    
    
};

console.log(`Previous product name: ${productName}`)


////////////////////////
// INIT FUNCTIONS
////////////////////////

// Create Reusable Dropdown for Supplier, Assortments, Commodity Group, and Sector Name Options
const populateDropdown = (requestUrl, selectElement, optionValue, optionText) => {
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

      // Add 'General' and 'Default' options if not already present
      data.results.forEach((item) => {
        const option = document.createElement('option');
        option.value = item[optionValue];
        option.appendChild(document.createTextNode(item[optionText]));
        
        // Set selected option to 'General' or 'Default' if it exists in data.results
        if (item[optionText] === 'General' && hasGeneral) {
          option.selected = true;
        } else if (item[optionText] === 'Default' && hasDefault) {
          option.selected = true;
        } else if (item[optionText] === 'General Assortment' && hasGeneralAssortment) {
          option.selected = true;
        }
        
        selectElement.appendChild(option);
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
// const getProductNumber = () => {
//   const productNumber = document.getElementById('number');
//   let requestUrl = url + 'products';

//   fetch(requestUrl, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': 'Basic ' + btoa(username + ':' + password),
//     },
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       const results = data.results
//       console.log(results)

//       results.sort((a, b) => a.number.length - b.number.length)
      
//       // Longest product number
//       let longestNumber = '';
//       results.forEach(product => {
//         const productNumber = product.number.toString();
//         if (productNumber.length > longestNumber.length) {
//           longestNumber = productNumber;
//         }
//       });
//       console.log('Longest product number:', longestNumber);

//       // Other longest product number
      
//       const assignLastProductNumber = longestNumber ? longestNumber : "0";
//       const nextProductNumber = assignLastProductNumber + "1";

//       if (!results.includes(nextProductNumber)) {
//         productNumber.textContent = nextProductNumber
//         productNumber.value = nextProductNumber
//       } else {
//         productNumber.textContent = 'Auto generated number exists. Make your own.'
//       }
      
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//     });
// };

//////////////////////////////////////////////
// NAVBAR BUTTONS FUNCTIONS - 'GET'
/////////////////////////////////////////////

const fetchDataAndPopulateTable = (requestUrlValue, requestName, responseBoxId) => {
  let requestUrl = url + requestUrlValue

  fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(username + ':' + password),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let responseBox = document.getElementById(responseBoxId);
      responseBox.innerHTML = "<h3>" + requestName + "</h3>";

      // Sort items alphabetically
      data.results.sort((a, b) => a.name.localeCompare(b.name));

      // Create table structure
      let table = document.createElement('table');
      let tableHeader = document.createElement('thead');
      let headerRow = document.createElement('tr');
      let nameHeader = document.createElement('th');
      let numberHeader = document.createElement('th');

      nameHeader.textContent = 'Name';
      numberHeader.textContent = 'Number';

      headerRow.appendChild(nameHeader);
      headerRow.appendChild(numberHeader);
      tableHeader.appendChild(headerRow);
      table.appendChild(tableHeader);

      let tableBody = document.createElement('tbody');

      // Display only the first 20 results
      const visibleResults = data.results.slice(0, 20);

      visibleResults.forEach((item) => {
        let row = document.createElement('tr');
        let nameCell = document.createElement('td');
        let numberCell = document.createElement('td');

        nameCell.textContent = item.name;
        numberCell.textContent = item.number;

        row.appendChild(nameCell);
        row.appendChild(numberCell);
        tableBody.appendChild(row);
      });

      table.appendChild(tableBody);
      responseBox.appendChild(table);

      // Check if there are more than 20 results
      if (data.results.length > 20) {
        // Create a button to load more results
        let loadMoreButton = document.createElement('button');
        loadMoreButton.textContent = 'Load More';
        responseBox.appendChild(loadMoreButton);

        loadMoreButton.addEventListener('click', () => {
          // Call the callback function to fetch the next 20 results
          fetchNextResults(requestUrlValue, requestName, responseBoxId, data.results.slice(20));
        });

         // Create a button to load all results
         let loadAllButton = document.createElement('button');
         loadAllButton.textContent = 'Load All';
         responseBox.appendChild(loadAllButton);
 
         loadAllButton.addEventListener('click', () => {
           // Remove the "Load More" and "Load All" buttons
           loadMoreButton.remove();
           loadAllButton.remove();
 
           // Fetch and display all remaining results
           fetchAllResults(requestUrlValue, requestName, responseBoxId, data.results.slice(20));
         });
      }

      //*************************************************
      // NOTE: Make variable for filter at top of table
      //*************************************************

      // Create the filter options
      let filterContainer = document.createElement('div');
      filterContainer.classList.add('filter-container');

      let filterLabel = document.createElement('label');
      filterLabel.textContent = 'Sort by:';

      let filterSelect = document.createElement('select');
      filterSelect.addEventListener('change', () => {
        // Get the selected filter option
        let selectedOption = filterSelect.value;

        // Clear the table body
        tableBody.innerHTML = '';

        // Sort the results based on the selected filter option
        let sortedResults = sortResults(data.results, selectedOption);

        // Display the sorted results in the table
        sortedResults.forEach((item) => {
          let row = document.createElement('tr');
          let nameCell = document.createElement('td');
          let numberCell = document.createElement('td');

          nameCell.textContent = item.name;
          numberCell.textContent = item.number;

          row.appendChild(nameCell);
          row.appendChild(numberCell);
          tableBody.appendChild(row);
        });
      });

      let ascendingOption = document.createElement('option');
      ascendingOption.value = 'ascending';
      ascendingOption.textContent = 'Ascending';

      let descendingOption = document.createElement('option');
      descendingOption.value = 'descending';
      descendingOption.textContent = 'Descending';

      filterSelect.appendChild(ascendingOption);
      filterSelect.appendChild(descendingOption);

      filterLabel.appendChild(filterSelect);
      filterContainer.appendChild(filterLabel);
      responseBox.appendChild(filterContainer);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

const sortResults = (results, sortOption) => {
  // Clone the results array to avoid modifying the original array
  let sortedResults = [...results];

  if (sortOption === 'ascending') {
    sortedResults.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortOption === 'descending') {
    sortedResults.sort((a, b) => b.name.localeCompare(a.name));
  }

  return sortedResults;
};

const fetchNextResults = (requestUrlValue, requestName, responseBoxId, remainingResults) => {
  // Create a new request URL value to fetch the next 20 results
  let requestUrl = url + requestUrlValue + '?offset=20';

  fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(username + ':' + password),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let responseBox = document.getElementById(responseBoxId);

      let tableBody = responseBox.querySelector('tbody');

      // Append the next 20 results to the table
      remainingResults.slice(0, 20).forEach((item) => {
        let row = document.createElement('tr');
        let nameCell = document.createElement('td');
        let numberCell = document.createElement('td');

        nameCell.textContent = item.name;
        numberCell.textContent = item.number;

        row.appendChild(nameCell);
        row.appendChild(numberCell);
        tableBody.appendChild(row);
      });

      // Remove the loaded results from the remaining results array
      remainingResults.splice(0, 20);

      // Check if there are more remaining results
      if (remainingResults.length > 0) {
        // Remove the previous "Load More" button
        let loadMoreButton = responseBox.querySelector('button');
        loadMoreButton.remove();

        // Create a new "Load More" button
        let newLoadMoreButton = document.createElement('button');
        newLoadMoreButton.textContent = 'Load More';
        responseBox.appendChild(newLoadMoreButton);

        newLoadMoreButton.addEventListener('click', () => {
          // Call the callback function recursively to fetch the next 20 results
          fetchNextResults(requestUrlValue, requestName, responseBoxId, remainingResults);
        });
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

const fetchAllResults = (requestUrlValue, requestName, responseBoxId, remainingResults) => {
  // Create a new request URL value to fetch all remaining results
  let requestUrl = url + requestUrlValue + '?offset=' + remainingResults.length;

  fetch(requestUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + btoa(username + ':' + password),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      let responseBox = document.getElementById(responseBoxId);

      let table = responseBox.querySelector('table');
      let tableBody = table.querySelector('tbody');

      // Append all remaining results to the table
      data.results.forEach((item) => {
        let row = document.createElement('tr');
        let nameCell = document.createElement('td');
        let numberCell = document.createElement('td');

        nameCell.textContent = item.name;
        numberCell.textContent = item.number;

        row.appendChild(nameCell);
        row.appendChild(numberCell);
        tableBody.appendChild(row);
      });

      // Remove the loaded results from the remaining results array
      remainingResults.splice(0, data.results.length);

      // Check if there are more remaining results
      if (remainingResults.length > 0) {
        // Call the callback function recursively to fetch all remaining results
        fetchAllResults(requestUrlValue, requestName, responseBoxId, remainingResults);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};

//////////////////////////////////////////////
// NAVBAR ARGUMENTS
/////////////////////////////////////////////

const getSuppliersNav = () => {
  // let requestUrl = url + 'suppliers';
  fetchDataAndPopulateTable('suppliers', 'Suppliers', 'serverResponse');
};

const getCommodityGroupsNav = () => {
  // let requestUrl = url + 'commodityGroups';
  fetchDataAndPopulateTable('commodityGroups', 'Commmodity Groups', 'serverResponse');
};

const getSectorsNav = () => {
  // let requestUrl = url + 'suppliers';
  fetchDataAndPopulateTable('sectors', 'Sectors', 'serverResponse');
};

///////////////////////////
// TOGGLE SUPPLIERS
//////////////////////////

const toggleSupplierSection = () => {
  const section = document.getElementById('supplier_section');
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

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
  document.getElementById('supplier_number').value = '';
  document.getElementById('supplier_name').selectedIndex = 0;
  document.getElementById('orderCode').value = '';
  document.getElementById('supplier_value').value = '';
  document.getElementById('containerSize').value = '1';

  // Hide the supplier_section div
  supplierSection.style.display = 'none';
};

const priceInputValue = (e) => {
  prices = e.target.value;
}

const productCodeValue = (e) => {
  product_code = e.target.value;
}

const productNameValue = (e) => {
  productName = e.target.value;
}



const init = () => {
  productSubmitForm.addEventListener('submit', onProductSubmit);
  prices.addEventListener('input', priceInputValue);
  product_code.addEventListener('input', productCodeValue);
  productName.addEventListener('input', productNameValue);

  getSuppliersBtn.addEventListener('click', getSuppliersNav);
  getCommodityGroupsBtn.addEventListener('click', getCommodityGroupsNav);
  getSectorsBtn.addEventListener('click', getSectorsNav);

  // getProductNumber();
  getAssortmentNames();
  getSuppliers();
  getCommodityGroups();
  getSectors();
  getPriceGroups();
  
  toggleSupplierBtn.addEventListener('click', toggleSupplierSection)

  resetForm();
}

init();