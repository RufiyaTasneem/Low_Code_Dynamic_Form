import { Moon, Sun } from "lucide-react";
import useTheme from "../hooks/useThemes";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button onClick={toggleTheme} type="button" aria-label="Toggle theme">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
}
