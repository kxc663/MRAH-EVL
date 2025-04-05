// lib/api.js

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate fetching data for a product page
export async function fetchProductData(productId) {
    console.log(`API: Fetching data for product ${productId}...`);

    // Simulate some delay for the main product data
    await delay(50); // ms

    const product = {
        id: productId,
        name: `Product ${productId}`,
        description: `This is a detailed description for awesome Product ${productId}. Buy it now!`,
        price: (productId * 10.5).toFixed(2),
    };

    // Simulate a potentially SLOWER fetch for recommendations
    await delay(150); // ms - make this noticeably slower maybe

    const recommendations = [
        { id: `rec-${productId}-1`, name: `Related Item ${productId}-A`},
        { id: `rec-${productId}-2`, name: `Related Item ${productId}-B`},
        { id: `rec-${productId}-3`, name: `Related Item ${productId}-C`},
    ];

    console.log(`API: Data fetched for product ${productId}.`);
    return {
        product,
        recommendations,
    };
}