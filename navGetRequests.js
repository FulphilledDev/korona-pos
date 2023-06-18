// API Credentials for one user
const url = "https://167.koronacloud.com/web/api/v3/accounts/b281e777-8a54-4ffb-bb1e-19e594454736/";
const username = "main";
const password = "1234";

const getCommodityGroupsBtn = document.getElementById('getCommodityGroupsBtn')
const getSuppliersBtn = document.getElementById('getSuppliersBtn')
const getSectorsBtn = document.getElementById('getSectorsBtn')

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
  showResponseBox();
};

const getCommodityGroupsNav = () => {
  // let requestUrl = url + 'commodityGroups';
  fetchDataAndPopulateTable('commodityGroups', 'Commmodity Groups', 'serverResponse');
  showResponseBox();

};

const getSectorsNav = () => {
  // let requestUrl = url + 'suppliers';
  fetchDataAndPopulateTable('sectors', 'Sectors', 'serverResponse');
  showResponseBox();

};

const init = () => {
    getSuppliersBtn.addEventListener('click', getSuppliersNav);
    getCommodityGroupsBtn.addEventListener('click', getCommodityGroupsNav);
    getSectorsBtn.addEventListener('click', getSectorsNav);
}

init();
