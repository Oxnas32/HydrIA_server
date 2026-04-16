import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTelemetry } from "../context/TelemetryContext";
import { useViewMode } from "../context/ViewModeContext";

const simulatedStations = [
  { id: "sim-1", name: "Madrid", location: "Madrid", lat: 40.4168, lng: -3.7038, waterLevelCm: 110, rainMm: 18, batteryV: 3.8 },
  { id: "sim-2", name: "Barcelona", location: "Barcelona", lat: 41.3874, lng: 2.1686, waterLevelCm: 135, rainMm: 24, batteryV: 3.7 },
  { id: "sim-3", name: "Valencia", location: "Valencia", lat: 39.4699, lng: -0.3763, waterLevelCm: 95, rainMm: 14, batteryV: 3.9 },
  { id: "sim-4", name: "Sevilla", location: "Sevilla", lat: 37.3891, lng: -5.9845, waterLevelCm: 82, rainMm: 11, batteryV: 3.8 },
  { id: "sim-5", name: "Bilbao", location: "Bilbao", lat: 43.263, lng: -2.935, waterLevelCm: 145, rainMm: 20, batteryV: 3.7 },
  { id: "sim-6", name: "Zaragoza", location: "Zaragoza", lat: 41.6488, lng: -0.8891, waterLevelCm: 76, rainMm: 8, batteryV: 3.9 },
  { id: "sim-7", name: "Málaga", location: "Málaga", lat: 36.7213, lng: -4.4214, waterLevelCm: 88, rainMm: 10, batteryV: 3.8 },
  { id: "sim-8", name: "Valladolid", location: "Valladolid", lat: 41.6523, lng: -4.7245, waterLevelCm: 92, rainMm: 13, batteryV: 3.8 },
  { id: "sim-9", name: "Vigo", location: "Vigo", lat: 42.2406, lng: -8.7207, waterLevelCm: 130, rainMm: 26, batteryV: 3.7 },
  { id: "sim-10", name: "A Coruña", location: "A Coruña", lat: 43.3623, lng: -8.4115, waterLevelCm: 98, rainMm: 15, batteryV: 3.8 },
];

type NationalMapProps = {
  onSelectStation?: (station: any) => void;
};

function getStatus(level?: number) {
  if (level == null) return "Sin datos";
  if (level >= 120) return "Alerta";
  if (level >= 80) return "Vigilancia";
  return "Normal";
}

function getMarkerColor(status: string) {
  if (status === "Normal") return "#16a34a";
  if (status === "Vigilancia") return "#f97316";
  if (status === "Alerta") return "#dc2626";
  return "#94a3b8";
}

export default function NationalMap({ onSelectStation }: NationalMapProps) {
  const { stations } = useTelemetry();
  const { mode } = useViewMode();

  const realStations = stations.filter(
    (station: any) =>
      typeof station?.lat === "number" && typeof station?.lng === "number"
  );

  const stationsToShow = mode === "real" ? realStations : simulatedStations;

  return (
    <div className="h-[520px] w-full overflow-hidden rounded-2xl">
      <MapContainer
        center={[40.2, -3.7]}
        zoom={6.3}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stationsToShow.map((station: any, index: number) => {
          const status = getStatus(station?.waterLevelCm);
          const color = getMarkerColor(status);

          return (
            <CircleMarker
              key={station?.id ?? index}
              center={[station.lat, station.lng]}
              radius={10}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: 2,
              }}
              eventHandlers={{
                click: () => {
                  if (onSelectStation) onSelectStation(station);
                },
              }}
            >
              <Popup>
                <div>
                  <div className="font-semibold">{station?.name ?? "Estación"}</div>
                  <div>{station?.location ?? station?.province ?? "Sin ubicación"}</div>
                  <div>Estado: {status}</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}