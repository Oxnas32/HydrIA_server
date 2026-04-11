import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { CircleMarker } from "react-leaflet/CircleMarker";
import { Popup } from "react-leaflet/Popup";
import { useTelemetry } from "../context/TelemetryContext";

function colorFor(risk: string) {
  if (risk === "OK") return "var(--status-safe)";
  if (risk === "WARN") return "var(--status-warn)";
  return "var(--status-danger)";
}

export default function NationalMap() {
  const { stations } = useTelemetry();
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="border-b border-border p-4">
        <div className="text-sm font-medium">Mapa nacional</div>
        <div className="text-xs text-muted-foreground">Estado por estación</div>
      </div>

      <div className="h-[420px]">
        <MapContainer center={[40.4168, -3.7038] as [number, number]} zoom={6} className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {stations.filter((s) => s.lat !== undefined && s.lng !== undefined).map((s) => (
            <CircleMarker
              key={s.id}
              center={[s.lat, s.lng] as [number, number]}
              radius={9}
              pathOptions={{
                color: colorFor(s.risk),
                fillColor: colorFor(s.risk),
                fillOpacity: 0.35,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-medium">{s.name || s.id}</div>
                  <div className="text-xs opacity-70">
                    {s.province || "Sin provincia"} · {s.risk}
                    {s.battery !== undefined && ` · batería ${s.battery}%`}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}