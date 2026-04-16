import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface Station {
  id: string;
  name: string;
  province?: string;
  location?: string;
  lat?: number;
  lng?: number;
  waterLevelCm?: number;
  rainMm?: number;
  batteryV?: number;
  risk?: string;
}

interface AlertItem {
  id: string;
  title: string;
  description: string;
  level: string;
  stationName?: string;
}

interface TelemetryContextType {
  stations: Station[];
  alerts: AlertItem[];
  error: string | null;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(
  undefined
);

function buildAlerts(stations: Station[]) {
  return stations
    .filter((station) => (station.waterLevelCm ?? 0) >= 80)
    .map((station) => {
      const isAlert = (station.waterLevelCm ?? 0) >= 120;

      return {
        id: `alert-${station.id}`,
        title: isAlert
          ? `Alerta en ${station.name}`
          : `Vigilancia en ${station.name}`,
        description: isAlert
          ? "Se ha detectado un nivel elevado en la estación."
          : "La estación requiere seguimiento.",
        level: isAlert ? "Alerta" : "Vigilancia",
        stationName: station.name,
      };
    });
}

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [stations, setStations] = useState<Station[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/stations")
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data.data)) {
          const newStations = data.data.map((item: any) => ({
            id: String(item.id ?? item.nodeId ?? ""),
            name: item.name ?? item.site ?? "Estación",
            province: item.province,
            location: item.location ?? item.province,
            lat: item.lat,
            lng: item.lng,
            waterLevelCm: item.waterLevelCm,
            rainMm: item.rainMm,
            batteryV: item.batteryV ?? item.battery,
            risk: item.risk,
          }));

          setStations(newStations);
          setAlerts(buildAlerts(newStations));
          setError(null);
        }
      })
      .catch(() => {
        setError("No se ha podido conectar con la API.");
      });
  }, []);

  return (
    <TelemetryContext.Provider value={{ stations, alerts, error }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within TelemetryProvider");
  }
  return context;
}