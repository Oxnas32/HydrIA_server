import { NavLink, Outlet } from "react-router-dom";
import logo from "../assets/logo.png";

const linkBase =
  "block rounded-lg px-3 py-2 text-sm transition hover:bg-accent";
const linkActive = "bg-accent text-foreground font-medium";
const linkIdle = "text-muted-foreground";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-[260px_1fr]">
        <aside className="border-r border-border bg-card p-4">
          {/* Logo grande */}
          <div className="mb-6 h-27 overflow-hidden rounded-xl bg-background/40 flex items-center justify-center">
            <img
              src={logo}
              alt="HydrIA"
              className="h-full w-full object-contain scale-[2] origin-center"
            />
          </div>

          <nav className="space-y-2">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/stations"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              Estaciones
            </NavLink>

            <NavLink
              to="/alerts"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkIdle}`
              }
            >
              Alertas
            </NavLink>
          </nav>
        </aside>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}