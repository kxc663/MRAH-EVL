// components/Header.js
import Link from 'next/link';
import React, { useState } from 'react';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false); // Simple interactivity example
    console.log("Header rendering/hydrating");

    return (
        <header style={{ background: '#eee', padding: '10px', marginBottom: '20px' }}>
            <Link href="/">Home</Link> | {' '}
            <button onClick={() => setIsOpen(!isOpen)}>Menu ({isOpen ? 'Open' : 'Closed'})</button>
            {isOpen && <nav style={{ marginTop: '5px' }}>Submenu Item 1 | Submenu Item 2</nav>}
            <hr/>
        </header>
    );
}