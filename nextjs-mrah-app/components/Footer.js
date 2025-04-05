// components/Footer.js
import React, { useState } from 'react';

export default function Footer() {
    const [email, setEmail] = useState('');
    console.log("Footer rendering/hydrating");

    const handleSubscribe = (e) => {
        e.preventDefault();
        alert(`Subscribed with ${email}`);
        setEmail('');
    };

    return (
        <footer style={{ background: '#ddd', padding: '10px', marginTop: '30px' }}>
             <hr/>
            <p>© {new Date().getFullYear()} My Awesome Shop</p>
            <nav>
                <a href="/about">About Us</a> | <a href="/contact">Contact</a>
            </nav>
            <form onSubmit={handleSubscribe} style={{marginTop: '10px'}}>
                 <label htmlFor="email-sub">Subscribe:</label>
                 <input
                    id="email-sub"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    required
                 />
                 <button type="submit">Go</button>
            </form>
        </footer>
    );
}