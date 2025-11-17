# Theme Toggle Feature

## Overview
A dark/light mode theme toggle has been implemented across the entire application for an enhanced user experience.

## Features

### 🎨 Theme Colors

**Light Mode:**
- Primary: `#B6AE9F`
- Secondary: `#C5C7BC`
- Tertiary: `#DEDED1`
- Background: `#FBF3D1`

**Dark Mode:**
- Primary: `#10b981` (Emerald Green)
- Background: Dark gradients (`#0f172a`, `#1e293b`, `#111827`)
- Text: Light colors (`#f9fafb`, `#d1d5db`)

### 🔧 Implementation

1. **ThemeContext** (`src/Context/ThemeContext.jsx`)
   - Manages global theme state
   - Persists theme preference in localStorage
   - Provides `isDarkMode` state and `toggleTheme` function

2. **Theme Variables** (`src/theme.css`)
   - CSS custom properties for both themes
   - Easy-to-maintain color system
   - Smooth transitions between themes

3. **Global Styles** (`src/index.css`)
   - Theme-aware scrollbar
   - Theme-aware text selection
   - Smooth color transitions

4. **Theme Toggle Button** (in Navbar)
   - Sun icon for dark mode (click to switch to light)
   - Moon icon for light mode (click to switch to dark)
   - Animated hover effects
   - Accessible tooltip

### 🚀 Usage

The theme is automatically applied to all components. To use the theme in your components:

```jsx
import { useTheme } from '../Context/ThemeContext';

function YourComponent() {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {isDarkMode ? 'Dark' : 'Light'}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### 🎯 Using CSS Variables

In your component CSS files, use the theme variables:

```css
.your-component {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
}

.your-button {
  background: var(--accent-primary);
  color: var(--text-primary);
}

.your-button:hover {
  background: var(--accent-hover);
  box-shadow: var(--shadow-accent);
}
```

### 📦 Components Updated

- ✅ Navbar - with theme toggle button
- ✅ App - wrapped with ThemeProvider
- ✅ Global styles (index.css, theme.css)
- ✅ Error and loading states

### 🎨 Styling Approach

The theme system uses:
- CSS custom properties (variables) for easy theme switching
- Smooth transitions for seamless theme changes
- localStorage for persistence across sessions
- React Context for state management

### 🔄 Theme Persistence

The selected theme is saved to `localStorage` and automatically restored when the user returns to the application.

### 🎭 Animation Effects

- Smooth color transitions (0.3s ease)
- Animated toggle button with hover effects
- Icon rotation on theme switch
- Glow effects on hover

## Browser Support

Works in all modern browsers that support:
- CSS Custom Properties
- localStorage
- ES6 JavaScript
