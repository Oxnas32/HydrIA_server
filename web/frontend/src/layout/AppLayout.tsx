import { NavLink, Outlet } from "react-router-dom";
import dropLogo from "../assets/logo.png";
import { useTelemetry } from "../context/TelemetryContext";

export default function AppLayout() {
  const { error } = useTelemetry();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {error && (
        <div className="bg-red-600 px-4 py-2 text-center text-sm">
          {error}
        </div>
      )}

      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-visible">
              <img
                src={dropLogo}
                alt="HydrIA"
                className="h-10 w-10 scale-[2.4] object-contain"
              />
            </div>

            <span className="text-4xl font-bold tracking-tight text-white">
              HydR<span className="text-cyan-400">IA</span>
            </span>
          </NavLink>

          <nav className="flex items-center gap-3 text-sm">
            <NavLink to="/" className="rounded px-3 py-2 hover:bg-white/10">
              Inicio
            </NavLink>
            <NavLink to="/stations" className="rounded px-3 py-2 hover:bg-white/10">
              Estaciones
            </NavLink>
            <NavLink to="/alerts" className="rounded px-3 py-2 hover:bg-white/10">
              Alertas
            </NavLink>
            <NavLink to="/how-it-works" className="rounded px-3 py-2 hover:bg-white/10">
              ¿Cómo funciona?
            </NavLink>
            <NavLink to="/project" className="rounded px-3 py-2 hover:bg-white/10">
              Información proyecto
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}