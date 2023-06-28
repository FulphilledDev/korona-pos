// API Credentials
const url = "https://167.koronacloud.com/web/api/v3/accounts/dd0b749a-56f5-4185-a782-590230a8530f/";
const username = "support";
const password = "support";

// Fetch all products from the API and store them in an array
const fetchAllProducts = async () => {
  const requestUrl = url + 'products';
  let page = 1;
  let totalPages = 1;
  const allProducts = [];

  while (page <= totalPages) {
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
    allProducts.push(...products);
    page++;
  }

  return allProducts;
};

// Function to check if product name or product code exists in the array of products
const checkProductExists = async (productName, productCode) => {
  try {
    // Fetch all products
    const products = await fetchAllProducts();

    if (!products) {
      console.error('Failed to fetch products');
      return false;
    }

    // Log the fetched products
    console.log('Fetched Products:', products);

    // Create a list of product names and product codes
    const productList = [];

    products.forEach(product => {
      productList.push(product.name.toLowerCase());

      if (product.codes) {
        product.codes.forEach(code => {
          productList.push(code.productCode);
        });
      }
    });

    // Check if the product name or product code exists in the array
    const exists = productList.includes(productName.toLowerCase()) || productList.includes(productCode);

    console.log('Product Existence Check:', exists);

    return exists;
  } catch (error) {
    console.error('Error checking product existence:', error);
    return false;
  }
};


export { checkProductExists, fetchAllProducts };