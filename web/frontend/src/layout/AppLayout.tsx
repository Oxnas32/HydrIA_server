import { NavLink, Outlet } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import dropLogo from "../assets/logo.png";
import { useTelemetry } from "../context/TelemetryContext";
import { useTheme } from "../context/ThemeContext";
import { useViewMode } from "../context/ViewModeContext";

export default function AppLayout() {
  const { error } = useTelemetry();
  const { theme, toggleTheme } = useTheme();
  const { mode, setMode } = useViewMode();

  return (
    <div className="min-h-screen bg-cyan-50 text-slate-900 dark:bg-indigo-950 dark:text-white transition-colors duration-300">
      {error && (
        <div className="bg-red-600 px-4 py-2 text-center text-sm text-white">
          {error}
        </div>
      )}

      <header className="border-b border-slate-200 dark:border-white/10 bg-white/90 dark:bg-indigo-950/90 backdrop-blur transition-colors duration-300">
        <div className="mx-auto flex flex-col md:flex-row max-w-7xl items-center justify-between px-6 py-4 gap-4 md:gap-0">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-visible">
              <img
                src={dropLogo}
                alt="HydrIA"
                className="h-10 w-10 scale-[2.4] object-contain"
              />
            </div>

            <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hyd<span className="text-indigo-600 dark:text-fuchsia-400">RIA</span>
            </span>
          </NavLink>

          <nav className="flex flex-wrap justify-center items-center gap-2 md:gap-3 text-sm">
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
            
            <div className="ml-2 md:ml-4 flex items-center gap-2 border-l border-slate-300 dark:border-white/20 pl-2 md:pl-4">
              <div className="flex bg-slate-200/70 dark:bg-black/30 p-1 rounded-lg">
                <button 
                  onClick={() => setMode('real')} 
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${mode === 'real' ? 'bg-white text-indigo-600 shadow-sm dark:bg-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'}`}
                >
                  Real
                </button>
                <button 
                  onClick={() => setMode('simulation')} 
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${mode === 'simulation' ? 'bg-orange-400 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'}`}
                >
                  Simulación
                </button>
              </div>

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