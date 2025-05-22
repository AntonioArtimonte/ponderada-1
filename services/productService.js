// services/productService.js
import { generateMockProducts, getUserAddedProducts } from '../utils/mockData';
import { APP_CONFIG } from '../config/appConfig'; // Ensure this path is correct
import { addUserProduct as localAddUserProduct } from '../utils/mockData'; // Keep this if you had it

// --- Lazy initialization for allProducts ---
let allProducts = null; // Initialize as null

const getAllProducts = () => {
  if (allProducts === null) {
    // Only generate if it hasn't been generated yet
    allProducts = generateMockProducts();
    console.log("Products generated. Count:", allProducts ? allProducts.length : 0); // Debug log
    if (!APP_CONFIG) {
        console.error("CRITICAL: APP_CONFIG is still undefined when generating products in getAllProducts.");
    } else {
        console.log("APP_CONFIG.maxProductsToDisplay in getAllProducts:", APP_CONFIG.maxProductsToDisplay);
    }
  }
  return allProducts;
};
// --- End of lazy initialization ---

export const fetchProducts = async (page = 1, limit, filters = {}) => {
  const actualLimit = limit !== undefined
    ? limit
    : (APP_CONFIG ? APP_CONFIG.productsPerPage : 10);

  return new Promise((resolve) => {
    setTimeout(() => {
      const currentAllProducts = getAllProducts(); // Use the getter
      const combinedProducts = [...getUserAddedProducts(), ...currentAllProducts];

      let filteredProducts = combinedProducts;

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term)
        );
      }
      if (filters.category) {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category);
      }

      const startIndex = (page - 1) * actualLimit; // Use actualLimit
      const endIndex = page * actualLimit;         // Use actualLimit
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      resolve({
        data: paginatedProducts,
        total: filteredProducts.length,
        currentPage: page,
        hasNextPage: endIndex < filteredProducts.length,
      });
    }, 700);
  });
};

export const fetchProductById = async (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const currentAllProducts = getAllProducts(); // Use the getter
            const combinedProducts = [...getUserAddedProducts(), ...currentAllProducts];
            const product = combinedProducts.find(p => p.id === id);
            if (product) {
                resolve(product);
            } else {
                reject(new Error("Product not found"));
            }
        }, 300);
    });
};

export const addProduct = async (productData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newProduct = localAddUserProduct(productData);
            // If allProducts was already initialized, ensure the new product is also there for consistency if needed.
            // Note: getUserAddedProducts() already prepends, so combinedProducts in fetchProducts will get it.
            // However, if `allProducts` itself is used directly elsewhere, it might need updating.
            // For now, `addUserProduct` in mockData already updates its own cache.
            resolve(newProduct);
        }, 500);
    });
};


