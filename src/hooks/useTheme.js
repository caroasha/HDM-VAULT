import { useThemeContext } from '../store/ThemeContext';

export const useTheme = () => {
  const { theme, setTheme, toggleTheme } = useThemeContext();
  const isDark = theme === 'dark';
  return { theme, setTheme, toggleTheme, isDark };
};