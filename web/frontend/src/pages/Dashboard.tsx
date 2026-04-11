import NationalMap from "../components/NationalMap";
import { useTelemetry } from "../context/TelemetryContext";
import { Radio, Bell, AlertTriangle, Clock, Battery, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";


function riskLabel(risk: string) {
  if (risk === "OK") return "OK";
  if (risk === "WARN") return "Aviso";
  return "Alerta";
}

function riskChipClasses(risk: string) {
  return [
    "inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium",
    risk === "OK" && "bg-[var(--status-safe)]/15 text-[var(--status-safe)]",
    risk === "WARN" && "bg-[var(--status-warn)]/15 text-[var(--status-warn)]",
    risk === "ALERT" && "bg-[var(--status-danger)]/15 text-[var(--status-danger)]",
  ]
    .filter(Boolean)
    .join(" ");
}

function batteryTextClass(battery: number) {
  if (battery <= 20) return "text-[var(--status-danger)]";
  if (battery <= 50) return "text-[var(--status-warn)]";
  return "text-[var(--status-safe)]";
}

export default function Dashboard() {
    const { stations } = useTelemetry();
    const navigate = useNavigate();
    const activeCount = stations.length;
    const alertsToday = stations.filter((s) => s.risk === "ALERT").length;
    const riskZones = stations.filter((s) => s.risk !== "OK").length;
    const lastUpdated = stations[0]?.updated ?? "—";

  return (
    <>
      {/* Topbar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard nacional</h1>
          <p className="text-sm text-muted-foreground">Estado del despliegue y alertas automáticas</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            className="h-10 w-72 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Buscar estación, ciudad…"
          />
          <div className="hidden text-sm text-muted-foreground md:block">Última sync: {lastUpdated}</div>
        </div>
      </div>

      {/* Hero */}
        <div className="mb-10 rounded-2xl bg-card p-10 shadow-sm border border-border/60">
            <div className="mx-auto max-w-4xl text-center">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm text-foreground">
                <Activity className="h-4 w-4 text-[var(--status-safe)]" />
                Sistema nacional de alertas en tiempo real
                </div>

                <h2 className="mt-6 text-5xl font-semibold tracking-tight">
                Centro de control HydrIA
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Monitorización nacional de ríos y detección temprana de riesgos de inundación.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <button
                        onClick={() => navigate("/stations")} 
                        className="h-11 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm">
                        Ver estaciones
                    </button>
                    <button
                        onClick={() => navigate("/alerts")} 
                        className="h-11 rounded-xl border border-border bg-background px-6 text-sm font-medium">
                        Ver alertas
                    </button>
                </div>
            </div>
        </div>

      {/* KPI row */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: "Estaciones activas", value: String(activeCount), sub: "Mock", Icon: Radio },
          { title: "Alertas hoy", value: String(alertsToday), sub: "Auto", Icon: Bell },
          { title: "Zonas en riesgo", value: String(riskZones), sub: "Aviso / Alerta", Icon: AlertTriangle },
          { title: "Última lectura", value: lastUpdated, sub: "Timestamp", Icon: Clock },
        ].map(({ title, value, sub, Icon }) => (
          <div
            key={title}
            className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{title}</div>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 text-3xl font-semibold">{value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="mt-6">
        <NationalMap />
      </div>

      {/* Table */}
      <div className="mt-6 rounded-2xl border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/60 p-4">
          <div className="text-sm font-medium">Estaciones (vista rápida)</div>
          <div className="text-xs text-muted-foreground">Listado con estado y última actualización</div>
        </div>

        <div className="p-4">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="py-2">Estación</th>
                <th className="py-2">Provincia</th>
                <th className="py-2">Estado</th>
                <th className="py-2">Batería</th>
                <th className="py-2">Última actualización</th>
              </tr>
            </thead>

            <tbody>
              {stations.map((s) => (
                <tr key={s.id} className="border-b border-border/40 transition hover:bg-accent/40">
                  <td className="py-3">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">ID: {s.id}</div>
                  </td>

                  <td className="py-3">{s.province}</td>

                  <td className="py-3">
                    <span className={riskChipClasses(s.risk)}>
                      <span className="text-[10px] leading-none">●</span>
                      {riskLabel(s.risk)}
                    </span>
                  </td>

                  <td className="py-3">
                    <div className="inline-flex items-center gap-2">
                      <Battery className={`h-4 w-4 ${batteryTextClass(s.battery)}`} />
                      <span className={batteryTextClass(s.battery)}>{s.battery}%</span>
                    </div>
                  </td>

                  <td className="py-3">{s.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}