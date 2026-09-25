import { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
    return useContext(ThemeContext);
}

export const ThemeProvider = ({ children }) => {
    useEffect(() => {
        document.documentElement.classList.remove('dark-theme');
        document.documentElement.classList.add('light-theme');
        localStorage.removeItem('theme');
    }, []);

    const value = {};

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeContext;
