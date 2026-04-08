import { Link, useParams } from "react-router-dom";
import { stations } from "../mock";

export default function StationDetail() {
  const { id } = useParams();
  const s = stations.find((x) => x.id === id);

  if (!s) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Estación no encontrada</h1>
        <p className="text-sm text-muted-foreground">ID: {id}</p>
        <Link className="mt-4 inline-block underline" to="/stations">
          Volver a estaciones
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">
            <Link className="underline-offset-4 hover:underline" to="/stations">
              Estaciones
            </Link>{" "}
            / {s.id}
          </div>
          <h1 className="text-2xl font-semibold">{s.name}</h1>
          <p className="text-sm text-muted-foreground">{s.province} · Estado: {s.risk}</p>
        </div>

        <div className="text-right text-sm text-muted-foreground">
          <div>Batería: <span className="text-foreground font-medium">{s.battery}%</span></div>
          <div>Última act.: <span className="text-foreground font-medium">{s.updated}</span></div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Nivel de agua", value: "—", sub: "cm" },
          { title: "Lluvia", value: "—", sub: "mm" },
          { title: "Turbidez", value: "—", sub: "NTU (opcional)" },
        ].map((kpi) => (
          <div key={kpi.title} className="rounded-xl border border-border bg-card p-4">
            <div className="text-sm text-muted-foreground">{kpi.title}</div>
            <div className="mt-2 text-3xl font-semibold">{kpi.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Placeholder gráfico */}
      <div className="mt-6 rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="text-sm font-medium">Histórico (placeholder)</div>
          <div className="text-xs text-muted-foreground">Aquí irá la gráfica 24h/7d</div>
        </div>
        <div className="p-10 text-center text-sm text-muted-foreground">Próximamente</div>
      </div>

      {/* Eventos/alertas */}
      <div className="mt-6 rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="text-sm font-medium">Eventos recientes</div>
          <div className="text-xs text-muted-foreground">Alertas automáticas y cambios de estado</div>
        </div>
        <div className="p-4 text-sm text-muted-foreground">Sin eventos (mock)</div>
      </div>
    </>
  );
}