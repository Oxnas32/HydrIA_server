import { Link } from "react-router-dom";
import { stations } from "../mock";

export default function Stations() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Estaciones</h1>
        <p className="text-sm text-muted-foreground">Listado nacional (mock)</p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="text-sm font-medium">Todas las estaciones</div>
          <div className="text-xs text-muted-foreground">Haz click para ver detalle</div>
        </div>

        <div className="p-4">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr className="border-b border-border">
                <th className="py-2">Estación</th>
                <th className="py-2">Provincia</th>
                <th className="py-2">Estado</th>
                <th className="py-2">Batería</th>
                <th className="py-2">Última actualización</th>
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s.id} className="border-b border-border/60 hover:bg-accent/40">
                  <td className="py-3">
                    <Link className="font-medium underline-offset-4 hover:underline" to={`/stations/${s.id}`}>
                      {s.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">ID: {s.id}</div>
                  </td>
                  <td className="py-3">{s.province}</td>
                  <td className="py-3">{s.risk}</td>
                  <td className="py-3">{s.battery}%</td>
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