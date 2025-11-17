# 🎨 Quick Theme Reference Guide

## 🔥 Quick Start

### 1. Access Theme in Any Component
```jsx
import { useTheme } from '../Context/ThemeContext';

const { isDarkMode, toggleTheme } = useTheme();
```

### 2. Use CSS Variables in Your Styles
```css
.my-component {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

### 3. Add Light Theme Overrides (if needed)
```css
.light-theme .my-component {
  background: #FBF3D1;
}
```

## 📋 Available CSS Variables

### Backgrounds
- `var(--bg-primary)` - Main page background
- `var(--bg-secondary)` - Secondary sections
- `var(--bg-tertiary)` - Tertiary elements
- `var(--bg-card)` - Cards and panels

### Text
- `var(--text-primary)` - Main text
- `var(--text-secondary)` - Secondary text
- `var(--text-tertiary)` - Muted text

### Accents
- `var(--accent-primary)` - Primary accent color
- `var(--accent-secondary)` - Secondary accent
- `var(--accent-hover)` - Hover state

### Borders
- `var(--border-color)` - Standard borders
- `var(--border-accent)` - Accent borders

### Shadows
- `var(--shadow-sm)` - Small shadow
- `var(--shadow-md)` - Medium shadow
- `var(--shadow-lg)` - Large shadow
- `var(--shadow-accent)` - Accent glow shadow

### Overlays
- `var(--overlay-light)` - Light overlay
- `var(--overlay-accent)` - Accent overlay

## 🎨 Color Values

### Dark Mode
| Variable | Value | Usage |
|----------|-------|-------|
| `--accent-primary` | `#10b981` | Buttons, links, highlights |
| `--text-primary` | `#f9fafb` | Main text |
| `--bg-secondary` | `#1f2937` | Cards, panels |

### Light Mode
| Variable | Value | Usage |
|----------|-------|-------|
| `--accent-primary` | `#8B8370` | Buttons, links, highlights |
| `--text-primary` | `#2d3748` | Main text |
| `--bg-secondary` | `#DEDED1` | Cards, panels |

## 💡 Tips & Best Practices

### ✅ DO
- Use CSS variables for all colors
- Test both themes during development
- Add smooth transitions (0.3s ease)
- Use utility classes from theme.css

### ❌ DON'T
- Hardcode colors in component styles
- Forget to test light mode
- Use theme-specific colors without variables

## 🔌 Integration Examples

### Button Component
```jsx
// MyButton.jsx
import { useTheme } from '../Context/ThemeContext';

function MyButton({ children, onClick }) {
  const { isDarkMode } = useTheme();
  
  return (
    <button 
      className={`btn-themed ${isDarkMode ? 'dark' : 'light'}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

```css
/* MyButton.css */
.btn-themed {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--text-primary);
  border: 2px solid var(--border-accent);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-themed:hover {
  box-shadow: var(--shadow-accent);
  transform: translateY(-2px);
}
```

### Card Component
```jsx
// MyCard.jsx
function MyCard({ title, children }) {
  return (
    <div className="card-themed">
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

```css
/* MyCard.css */
.card-themed {
  background: var(--bg-card);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  color: var(--text-primary);
}
```

## 🎯 Common Patterns

### Pattern 1: Themed Container
```css
.container {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

### Pattern 2: Accent Element
```css
.highlight {
  color: var(--accent-primary);
  border-bottom: 2px solid var(--accent-primary);
}

.highlight:hover {
  color: var(--accent-hover);
  box-shadow: var(--shadow-accent);
}
```

### Pattern 3: Subtle Background
```css
.subtle-bg {
  background: var(--overlay-accent);
  border-left: 4px solid var(--accent-primary);
}
```

## 🚀 Testing Checklist

- [ ] Component looks good in dark mode
- [ ] Component looks good in light mode
- [ ] Transitions are smooth (no jarring changes)
- [ ] Text is readable in both modes
- [ ] Hover states work correctly
- [ ] Focus states are visible
- [ ] Colors have sufficient contrast

## 📚 Related Files

- `src/Context/ThemeContext.jsx` - Theme state management
- `src/theme.css` - CSS variables and utilities
- `src/index.css` - Global theme styles
- `src/Components/Navbar.jsx` - Theme toggle implementation
- `THEME_FEATURE.md` - Full documentation
- `ExampleComponent.jsx` - Working example

---

**Need Help?** Check the example component in `src/Components/ExampleComponent.jsx`
