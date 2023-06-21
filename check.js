// Purpose: To check if a product exists in the Korona API
// API Credentials for one user
const url = "https://167.koronacloud.com/web/api/v3/accounts/b281e777-8a54-4ffb-bb1e-19e594454736/";
const username = "main";
const password = "1234";
//Also thinking about putting a load/buffering screen while the data is being fetched
//on submit button click
// Function to check if product name or product code exists in the array of products
const checkProductExists = async (productName, productCode) => {
  const requestUrl = url + 'products';
  //initializing the page number and total pages
  let page = 1;
  let totalPages = 1;
  let productExists = false;

  while (page <= totalPages) {
    // Fetching the products from the API
    const response = await fetch(requestUrl + `?page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(username + ':' + password),
      },
    });

    const data = await response.json();
    const products = data.results;
    totalPages = data.resultsTotalPages;
//checking if the product exists in the array of products
    productExists = products.some(
      (product) =>
        product.name.toLowerCase() === productName.toLowerCase() ||
        product.codes.some((code) => code.productCode === productCode)
    );
//if the product exists, break out of the loop
    if (productExists) {
      break;
    }
//incrementing the page number to get the next page of products
    page++;
  }
//returning the productExists boolean
  return productExists;
};

// Export the function to be used in other files
export { checkProductExists };
