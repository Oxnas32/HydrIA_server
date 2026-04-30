import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTelemetry } from "../context/TelemetryContext";
import { useViewMode } from "../context/ViewModeContext";

import dropGreen from "../assets/drop-green.png";
import dropOrange from "../assets/drop-orange.png";
import dropRed from "../assets/drop-red.png";

const simulatedStations = [
  { id: "sim-1", name: "Madrid", location: "Madrid", lat: 40.4168, lng: -3.7038, waterLevelCm: 110, rainMm: 18, turbidity: 62, humidity: 74, riskLabel: "Vigilancia" },
  { id: "sim-2", name: "Barcelona", location: "Barcelona", lat: 41.3874, lng: 2.1686, waterLevelCm: 135, rainMm: 24, turbidity: 81, humidity: 86, riskLabel: "Alerta" },
  { id: "sim-3", name: "Valencia", location: "Valencia", lat: 39.4699, lng: -0.3763, waterLevelCm: 95, rainMm: 14, turbidity: 55, humidity: 69, riskLabel: "Vigilancia" },
  { id: "sim-4", name: "Sevilla", location: "Sevilla", lat: 37.3891, lng: -5.9845, waterLevelCm: 82, rainMm: 11, turbidity: 49, humidity: 66, riskLabel: "Vigilancia" },
  { id: "sim-5", name: "Bilbao", location: "Bilbao", lat: 43.263, lng: -2.935, waterLevelCm: 145, rainMm: 20, turbidity: 78, humidity: 72, riskLabel: "Alerta" },
  { id: "sim-6", name: "Zaragoza", location: "Zaragoza", lat: 41.6488, lng: -0.8891, waterLevelCm: 76, rainMm: 8, turbidity: 38, humidity: 41, riskLabel: "Normal" },
  { id: "sim-7", name: "Málaga", location: "Málaga", lat: 36.7213, lng: -4.4214, waterLevelCm: 88, rainMm: 10, turbidity: 52, humidity: 58, riskLabel: "Vigilancia" },
  { id: "sim-8", name: "Valladolid", location: "Valladolid", lat: 41.6523, lng: -4.7245, waterLevelCm: 92, rainMm: 13, turbidity: 46, humidity: 48, riskLabel: "Vigilancia" },
  { id: "sim-9", name: "Vigo", location: "Vigo", lat: 42.2406, lng: -8.7207, waterLevelCm: 130, rainMm: 26, turbidity: 74, humidity: 80, riskLabel: "Alerta" },
  { id: "sim-10", name: "A Coruña", location: "A Coruña", lat: 43.3623, lng: -8.4115, waterLevelCm: 98, rainMm: 15, turbidity: 58, humidity: 76, riskLabel: "Vigilancia" },
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

function getMarkerIcon(status: string) {
  let iconUrl = dropGreen;

  if (status === "Vigilancia") iconUrl = dropOrange;
  if (status === "Alerta") iconUrl = dropRed;

  return L.icon({
    iconUrl,
    iconSize: [36, 30],
    iconAnchor: [18, 15],
    popupAnchor: [0, -12],
  });
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
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {stationsToShow.map((station: any, index: number) => {
          const status = station?.riskLabel ?? getStatus(station?.waterLevelCm);

          return (
            <Marker
              key={station?.id ?? index}
              position={[station.lat, station.lng]}
              icon={getMarkerIcon(status)}
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
                  <div className="mt-1">Estado: {status}</div>
                  <div>Nivel: {station?.waterLevelCm ?? "—"} cm</div>
                  <div>Lluvia: {station?.rainMm ?? "—"} mm</div>
                  <div>Turbidez: {station?.turbidity ?? "—"}</div>
                  <div>Humedad: {station?.humidity ?? "—"}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}