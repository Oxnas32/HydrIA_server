import { NavLink, Outlet } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import dropLogo from "../assets/logo.png";
import { useTelemetry } from "../context/TelemetryContext";
import { useTheme } from "../context/ThemeContext";

export default function AppLayout() {
  const { error } = useTelemetry();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-cyan-50 text-slate-900 dark:bg-indigo-950 dark:text-white transition-colors duration-300">
      {error && (
        <div className="bg-red-600 px-4 py-2 text-center text-sm text-white">
          {error}
        </div>
      )}

      <header className="border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-indigo-950/90 backdrop-blur transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-visible">
              <img
                src={dropLogo}
                alt="HydrIA"
                className="h-10 w-10 scale-[2.4] object-contain"
              />
            </div>

            <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              HydR<span className="text-indigo-600 dark:text-fuchsia-400">IA</span>
            </span>
          </NavLink>

          <nav className="flex items-center gap-3 text-sm">
            <NavLink to="/" className="rounded px-3 py-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Inicio
            </NavLink>
            <NavLink to="/stations" className="rounded px-3 py-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Estaciones
            </NavLink>
            <NavLink to="/alerts" className="rounded px-3 py-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Alertas
            </NavLink>
            <NavLink to="/how-it-works" className="rounded px-3 py-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              ¿Cómo funciona?
            </NavLink>
            <NavLink to="/project" className="rounded px-3 py-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              Información proyecto
            </NavLink>
            
            <div className="ml-4 border-l border-slate-300 dark:border-white/20 pl-4">
              <button 
                onClick={toggleTheme}
                className="rounded-full p-2 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}