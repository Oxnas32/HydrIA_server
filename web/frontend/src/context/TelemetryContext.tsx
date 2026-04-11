import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type Risk = "OK" | "WARN" | "ALERT";

export interface TelemetryData {
  nodeId: string;
  site: string;
  province?: string;
  lat?: number;
  lng?: number;
  waterLevelCm: number;
  rainMm: number;
  batteryV: number;
  time?: string;
  risk?: Risk;
  updated?: string;
}

interface TelemetryContextType {
  stations: any[]; // Using any[] to match the mock array structure easily
  error: string | null;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [stations, setStations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3001/stations")
      .then(res => res.json())
      .then(data => {
        if (data && data.ok) {
          if (data.data.length === 0) {
            setError("No nodes configured in InfluxDB.");
          } else {
            setError(null);
            setStations(data.data);
          }
        }
      })
      .catch(err => {
        console.error(err);
        setError("Could not connect to the backend API.");
      });
    // Connect to the backend Server-Sent Events stream
    const eventSource = new EventSource("http://localhost:3001/events");

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.ok && payload.source === "database") {
          if (payload.action === "delete_all") {
            setStations([]);
            return;
          }
          if (payload.action === "delete" && payload.nodeId) {
            setStations((prev) => prev.filter((s) => s.id !== payload.nodeId));
            return;
          }

          if (!payload.data) return;
          const newData = payload.data as TelemetryData;

          let newRisk: Risk = "OK";
          if (newData.waterLevelCm > 150) newRisk = "WARN";
          if (newData.waterLevelCm > 200) newRisk = "ALERT";

          setStations((prevStations) => {
            const exists = prevStations.find((s) => s.id === newData.nodeId);
            if (exists) {
              return prevStations.map((station) =>
                station.id === newData.nodeId
                  ? {
                      ...station,
                      name: newData.site || station.name,
                      province: newData.province || station.province,
                      lat: newData.lat ?? station.lat,
                      lng: newData.lng ?? station.lng,
                      waterLevelCm: newData.waterLevelCm,
                      rainMm: newData.rainMm,
                      battery: newData.batteryV,
                      risk: newRisk,
                      updated: "ahora mismo",
                    }
                  : station
              );
            } else {
              return [
                ...prevStations,
                {
                  id: newData.nodeId,
                  name: newData.site || newData.nodeId,
                  province: newData.province,
                  lat: newData.lat,
                  lng: newData.lng,
                  waterLevelCm: newData.waterLevelCm,
                  rainMm: newData.rainMm,
                  battery: newData.batteryV,
                  risk: newRisk,
                  updated: "ahora mismo",
                }
              ];
            }
          });
        }
      } catch (err) {
        console.error("Failed to parse SSE payload:", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <TelemetryContext.Provider value={{ stations, error }}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
}
