// components/ProductDetail.js
import React from 'react';

export default function ProductDetail({ product }) {
    console.log("ProductDetail rendering/hydrating");
    if (!product) return <p>Product not found.</p>;

    const handleAddToCart = () => {
        alert(`Added ${product.name} to cart!`);
    };

    return (
        <section style={{ border: '1px solid blue', padding: '15px', marginBottom: '20px' }}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <button onClick={handleAddToCart}>Add to Cart</button>
        </section>
    );
}