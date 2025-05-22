// utils/mockData.js
import { faker } from '@faker-js/faker';
import { APP_CONFIG } from '../config/appConfig'; // Assuming this is now resolving correctly

// --- Lazy Initialization for mockUsers ---
let _mockUsers = null; // Internal variable

const getInitializedMockUsers = () => {
    if (_mockUsers === null) {
        // console.log("Initializing _mockUsers for the first time.");
        _mockUsers = [
            {
                id: '1',
                email: 'a@example.com',
                password: '12', // Store plain for mock, hash on server IRL
                name: 'Test User',
                phone: '123-456-7890',
                avatarUrl: `https://i.pravatar.cc/150?u=test@example.com`
            },
            {
                id: '2',
                email: 'jane@example.com',
                password: 'password456',
                name: 'Jane Doe',
                phone: '987-654-3210',
                avatarUrl: `https://i.pravatar.cc/150?u=jane@example.com`
            },
            // Add more predefined users if needed for testing
        ];
    }
    return _mockUsers;
};
// --- End of Lazy Initialization for mockUsers ---

export const generateMockProducts = (count) => {
  // Your existing generateMockProducts logic is fine if APP_CONFIG is resolving
  if (!APP_CONFIG) {
    console.warn("generateMockProducts called but APP_CONFIG is undefined. Using fallback count.");
    const resolvedCountFallback = count !== undefined ? count : 10000;

    if (generateMockProducts.cachedProducts && generateMockProducts.cachedProducts.length === resolvedCountFallback) {
        return generateMockProducts.cachedProducts;
    }
    const products = [];
    for (let i = 0; i < resolvedCountFallback; i++) {
        products.push({
            id: faker.string.uuid(),
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price()),
            imageUrl: `${faker.image.urlLoremFlickr({ category: 'technics', width: 640, height: 480 })}?random=${i}`,
            category: faker.commerce.department(),
            isFavorite: false,
        });
    }
    generateMockProducts.cachedProducts = products;
    return products;
  }

  const resolvedCount = count !== undefined ? count : APP_CONFIG.maxProductsToDisplay;

  if (generateMockProducts.cachedProducts && generateMockProducts.cachedProducts.length === resolvedCount) {
    return generateMockProducts.cachedProducts;
  }

  const products = [];
  for (let i = 0; i < resolvedCount; i++) {
    products.push({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      imageUrl: `${faker.image.urlLoremFlickr({ category: 'technics', width: 640, height: 480 })}?random=${i}`,
      category: faker.commerce.department(),
      isFavorite: false,
    });
  }
  generateMockProducts.cachedProducts = products;
  return products;
};

// Use the getter function for mockUsers
export const getMockUsers = () => {
  return getInitializedMockUsers();
};

// Use the getter function and then push to the initialized array
export const addMockUser = (userData) => { // userData expects { email, password, name, phone }
  const currentUsers = getInitializedMockUsers();
  const newUser = {
    id: faker.string.uuid(),
    email: userData.email,
    password: userData.password, // In a real app, this password would be hashed by the server
    name: userData.name,
    phone: userData.phone || '', // Default to empty if not provided
    avatarUrl: `https://i.pravatar.cc/150?u=${userData.email}` // Or a default avatar
  };
  currentUsers.push(newUser);
  return newUser;
};

let userAddedProducts = [];
export const addUserProduct = (productData) => {
    const newProduct = {
        id: faker.string.uuid(),
        ...productData,
        isUserAdded: true,
    };
    userAddedProducts.unshift(newProduct);
    // Ensure generateMockProducts.cachedProducts exists before trying to unshift to it
    if (generateMockProducts.cachedProducts && Array.isArray(generateMockProducts.cachedProducts)) {
        generateMockProducts.cachedProducts.unshift(newProduct);
    } else {
        // If cache isn't initialized or is not an array, this indicates generateMockProducts
        // hasn't run successfully yet or its cache got corrupted.
        // console.warn("addUserProduct: generateMockProducts.cachedProducts is not an array or not initialized.");
        // In this case, the new product will only be in userAddedProducts until the main list is regenerated.
    }
    return newProduct;
};

export const getUserAddedProducts = () => userAddedProducts;