export type Risk = "OK" | "WARN" | "ALERT";

export const stations = [
    { id: "A1", name: "Vigo · Río Lagares", province: "Pontevedra", risk: "OK" as Risk, updated: "hace 2 min", battery: 78, lat: 42.2406, lng: -8.7207 },
    { id: "A2", name: "Ourense · Río Miño", province: "Ourense", risk: "WARN" as Risk, updated: "hace 6 min", battery: 42, lat: 42.3350, lng: -7.8639 },
    { id: "A3", name: "Madrid · Río Manzanares", province: "Madrid", risk: "ALERT" as Risk, updated: "hace 1 min", battery: 19, lat: 40.4168, lng: -3.7038 },
  ];