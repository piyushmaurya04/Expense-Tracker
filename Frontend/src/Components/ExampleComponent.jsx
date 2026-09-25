/* Example Component with Theme Support */

import React from 'react';
import { useTheme } from '../Context/ThemeContext';
import './ExampleComponent.css';

function ExampleComponent() {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <div className="example-container">
            <h1 className="example-title">
                Current Theme: {isDarkMode ? '🌙 Dark' : '☀️ Light'}
            </h1>

            <div className="example-card">
                <h2>Theme-Aware Card</h2>
                <p>This card automatically adjusts to the current theme.</p>

                <button className="example-btn" onClick={toggleTheme}>
                    Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
                </button>
            </div>

            <div className="example-info">
                <h3>Using Theme in Your Component:</h3>
                <ul>
                    <li>Import useTheme hook</li>
                    <li>Access isDarkMode state</li>
                    <li>Use CSS variables in your styles</li>
                    <li>Add light-theme overrides if needed</li>
                </ul>
            </div>
        </div>
    );
}

export default ExampleComponent;
