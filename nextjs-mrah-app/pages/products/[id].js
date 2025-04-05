// FILE: nextjs-mrah-app/pages/products/[id].js
// PURPOSE: MRAH product page with potential FCP fix.
//
// This page uses a combination of SSR and client-side adaptive logic
// to potentially improve First Contentful Paint (FCP) performance.
//
// The main logic is:
// 1. Server-side render the initial page shell
// 2. Use a client-side hook to check for low-end devices/networks
import React, { useState, useEffect, useRef } from 'react'; // Import useRef for setTimeout cleanup
import dynamic from 'next/dynamic';
import LazyHydrate from 'react-lazy-hydration';

import Header from '@/components/Header';
import ProductDetail from '@/components/ProductDetail';
import { fetchProductData } from '@/lib/api';

// --- Dynamic Imports remain the same ---
const Recommendations = dynamic(() => import('@/components/Recommendations'), {
    ssr: true,
    loading: () => <div style={{ border: '1px solid green', padding: '15px', marginBottom: '20px', background: '#f0fff0', minHeight: '100px' }}><i>Loading Recommendations...</i></div>
});

const Footer = dynamic(() => import('@/components/Footer'), {
    ssr: true,
     loading: () => <div style={{ background: '#ddd', padding: '10px', marginTop: '30px', minHeight: '50px' }}><i>Loading Footer...</i></div>
});

// --- getServerSideProps remains the same ---
export async function getServerSideProps(context) {
    const { id } = context.params;
    console.log(`SSR (MRAH): Fetching data for ${id}`);
    const data = await fetchProductData(id);

    if (!data) return { notFound: true };

    return {
        props: {
            productData: data.product,
            recoData: data.recommendations,
        },
    };
}

// --- Adaptive Logic Helper Hook (with setTimeout fix) ---
function useAdaptiveChecks() {
    const [isLowEnd, setIsLowEnd] = useState(false);
    const [checked, setChecked] = useState(false);
    const timeoutIdRef = useRef(null); // Use useRef to store timeout ID for cleanup

    useEffect(() => {
        if (checked) return;

        timeoutIdRef.current = setTimeout(() => {
            console.log('MRAH Client: Running adaptive check...');
            const mem = navigator.deviceMemory;
            const cpu = navigator.hardwareConcurrency;
            const conn = navigator.connection;
            const lowMem = typeof mem !== 'undefined' && mem < 1.5;
            const lowCpu = typeof cpu !== 'undefined' && cpu <= 4;
            const slowNet = conn && (conn.effectiveType?.includes('2g') || conn.effectiveType?.includes('slow-2g') || conn.saveData);

            if (lowMem || lowCpu || slowNet) {
                console.log('MRAH Client: Low-end device/network detected.');
                setIsLowEnd(true);
            } else {
                console.log('MRAH Client: High-end device/network detected.');
                setIsLowEnd(false);
            }
            setChecked(true);
        }, 0);

        // Cleanup function: Clear the timeout if the component unmounts
        // before the timeout callback runs.
        return () => {
            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current);
            }
        };
        // Run this effect only once after the initial mount
    }, [checked]); // Dependency array ensures effect runs only once

    return { isLowEnd, hasChecked: checked };
}

// --- The Page Component (with initial render handling) ---
export default function ProductPage({ productData, recoData }) {
    console.log("ProductPage (MRAH) rendering...");
    const { isLowEnd, hasChecked } = useAdaptiveChecks();

    // --- Initial Render Handling (remains the same) ---
    // Render a consistent structure during SSR and the first client render
    // before the adaptive check completes and state updates.
    if (!hasChecked) {
        console.log("ProductPage (MRAH): Rendering initial shell (SSR or pre-check client render)");
         // Render basic shell matching the final structure but using placeholders.
         // Using the dynamic import's loading component is a good way to ensure
         // consistency if available and properly sized.
         const RecoLoading = Recommendations.renderLoading || (() => <div style={{ border: '1px solid green', padding: '15px', marginBottom: '20px', background: '#f0fff0', minHeight: '100px' }}><i>Loading Recommendations...</i></div>);
         const FooterLoading = Footer.renderLoading || (() => <div style={{ background: '#ddd', padding: '10px', marginTop: '30px', minHeight: '50px' }}><i>Loading Footer...</i></div>);

         return (
            <div>
                <Header />
                <main>
                    <ProductDetail product={productData} />
                    <RecoLoading />
                </main>
                <FooterLoading />
            </div>
         );
    }

    // --- Render with Hydration Control (after client check completes) ---
    console.log(`ProductPage (MRAH): Rendering with hydration control (isLowEnd: ${isLowEnd})`);
    return (
        <div>
            <Header />
            <main>
                <ProductDetail product={productData} />

                {/* Hydrate Recos when visible */}
                <LazyHydrate whenVisible={{ rootMargin: '100px' }}>
                    <Recommendations recommendations={recoData} />
                </LazyHydrate>
            </main>

            {/* Adaptive Footer Hydration */}
            <LazyHydrate whenIdle={!isLowEnd} ssrOnly={isLowEnd}>
                <Footer />
            </LazyHydrate>
        </div>
    );
}