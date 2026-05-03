import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTelemetry } from "../context/TelemetryContext";
import { useViewMode } from "../context/ViewModeContext";

import dropGreen from "../assets/drop-green.png";
import dropOrange from "../assets/drop-orange.png";
import dropRed from "../assets/drop-red.png";

import { simulatedStations } from "../data/simulatedStations";

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