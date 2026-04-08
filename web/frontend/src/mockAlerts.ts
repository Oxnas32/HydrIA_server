export type AlertLevel = "INFO" | "WARN" | "CRITICAL";

export const alerts = [
  { id: "AL-001", stationId: "A3", title: "Nivel alto detectado", level: "CRITICAL" as AlertLevel, time: "hace 1 min"},
  { id: "AL-002", stationId: "A2", title: "Lluvia intensa", level: "WARN" as AlertLevel, time: "hace 8 min"},
  { id: "AL-003", stationId: "A1", title: "Batería baja", level: "INFO" as AlertLevel, time: "hace 30 min"},
];