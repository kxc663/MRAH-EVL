// components/Recommendations.js
import React, { useState, useEffect } from 'react';

export default function Recommendations({ recommendations }) {
    const [visibleIndex, setVisibleIndex] = useState(0); // Example state
    console.log("Recommendations rendering/hydrating");

    useEffect(() => {
        // Example effect - might run only after hydration
        console.log('Recommendations component hydrated and mounted effect ran.');
        const timer = setInterval(() => {
             setVisibleIndex(prev => (prev + 1) % (recommendations?.length || 1));
        }, 3000); // Cycle through items
        return () => clearInterval(timer);
    }, [recommendations]);

    if (!recommendations || recommendations.length === 0) {
        return null;
    }

    return (
        <section style={{ border: '1px solid green', padding: '15px', marginBottom: '20px', background: '#f0fff0' }}>
            <h3>Recommendations</h3>
             {/* Simple carousel simulation */}
            <div>
                {recommendations.map((item, index) => (
                    <div key={item.id} style={{ display: index === visibleIndex ? 'block' : 'none', border: '1px dashed gray', padding: '5px', margin: '5px' }}>
                        <p>{item.name}</p>
                        <button onClick={() => alert(`Viewing ${item.name}`)}>View</button>
                    </div>
                ))}
            </div>
             <p>Showing item {visibleIndex + 1} of {recommendations.length}</p>
        </section>
    );
}