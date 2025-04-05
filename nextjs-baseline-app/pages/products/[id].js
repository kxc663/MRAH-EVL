// pages/products/[id].js
import React from 'react';
import Header from '@/components/Header';
import ProductDetail from '@/components/ProductDetail';
import Recommendations from '@/components/Recommendations';
import Footer from '@/components/Footer';
import { fetchProductData } from '@/lib/api';

// This function runs on the SERVER for every request to this page.
export async function getServerSideProps(context) {
    // 1. Get the dynamic 'id' parameter from the URL context
    const { id } = context.params; // e.g., if URL is /products/123, id is "123"

    console.log(`SSR (Baseline): Fetching server-side data for product id: ${id}`);

    // 2. Fetch data needed for this specific product using the id
    const data = await fetchProductData(id);

    // 3. Handle case where data wasn't found (optional but good practice)
    if (!data) {
        return { notFound: true }; // Returns a 404 page
    }

    // 4. Return the fetched data as props to the page component
    // These props will be serialized and sent to the client.
    return {
        props: {
            // Pass the data needed by the components
            productData: data.product,
            recoData: data.recommendations,
        },
    };
}

// This is the React component for the page. It runs on the server initially,
// and then "hydrates" on the client using the props from getServerSideProps.
export default function ProductPage({ productData, recoData }) {

    console.log("ProductPage (Baseline) React component rendering...");

    // Render the page structure using the imported components and passed props.
    // In the baseline, Next.js/React will hydrate ALL of these components
    // as soon as their JavaScript is loaded on the client.
    return (
        <div>
            <Header /> {/* Render Header */}
            <main>
                {/* Render ProductDetail, passing its specific data */}
                <ProductDetail product={productData} />

                {/* Render Recommendations normally, passing its data */}
                <Recommendations recommendations={recoData} />
            </main>
            {/* Render Footer normally */}
            <Footer />
        </div>
    );
}