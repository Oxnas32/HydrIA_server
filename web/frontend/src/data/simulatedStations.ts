export const simulatedStations = [
  { id: "sim-1", name: "Madrid", location: "Madrid", lat: 40.4168, lng: -3.7038, waterLevelCm: 110, rainMm: 18, turbidity: 62, humidity: 74, battery: 4.1, ext_wakeup: false, riskLabel: "Vigilancia", riskSummary: "Nivel elevado y lluvia moderada" },
  { id: "sim-2", name: "Barcelona", location: "Barcelona", lat: 41.3874, lng: 2.1686, waterLevelCm: 135, rainMm: 24, turbidity: 81, humidity: 86, battery: 3.8, ext_wakeup: true, riskLabel: "Alerta", riskSummary: "Nivel muy alto y lluvia significativa" },
  { id: "sim-3", name: "Valencia", location: "Valencia", lat: 39.4699, lng: -0.3763, waterLevelCm: 95, rainMm: 14, turbidity: 55, humidity: 69, battery: 4.2, ext_wakeup: false, riskLabel: "Vigilancia", riskSummary: "Nivel por encima de lo habitual" },
  { id: "sim-4", name: "Sevilla", location: "Sevilla", lat: 37.3891, lng: -5.9845, waterLevelCm: 82, rainMm: 11, turbidity: 49, humidity: 66, battery: 3.9, ext_wakeup: false, riskLabel: "Vigilancia", riskSummary: "Crecimiento reciente del nivel" },
  { id: "sim-5", name: "Bilbao", location: "Bilbao", lat: 43.263, lng: -2.935, waterLevelCm: 145, rainMm: 20, turbidity: 78, humidity: 72, battery: 4.0, ext_wakeup: true, riskLabel: "Alerta", riskSummary: "Crecida importante del caudal" },
  { id: "sim-6", name: "Zaragoza", location: "Zaragoza", lat: 41.6488, lng: -0.8891, waterLevelCm: 76, rainMm: 8, turbidity: 38, humidity: 41, battery: 4.1, ext_wakeup: false, riskLabel: "Normal", riskSummary: "Valores estables y normales" },
  { id: "sim-7", name: "Málaga", location: "Málaga", lat: 36.7213, lng: -4.4214, waterLevelCm: 88, rainMm: 10, turbidity: 52, humidity: 58, battery: 3.7, ext_wakeup: false, riskLabel: "Vigilancia", riskSummary: "Ligero aumento del nivel" },
  { id: "sim-8", name: "Valladolid", location: "Valladolid", lat: 41.6523, lng: -4.7245, waterLevelCm: 92, rainMm: 13, turbidity: 46, humidity: 48, battery: 3.6, ext_wakeup: false, riskLabel: "Vigilancia", riskSummary: "Posible riesgo en zonas bajas" },
  { id: "sim-9", name: "Vigo", location: "Vigo", lat: 42.2406, lng: -8.7207, waterLevelCm: 130, rainMm: 26, turbidity: 74, humidity: 80, battery: 4.0, ext_wakeup: true, riskLabel: "Alerta", riskSummary: "Lluvias persistentes y cauce alto" },
  { id: "sim-10", name: "A Coruña", location: "A Coruña", lat: 43.3623, lng: -8.4115, waterLevelCm: 98, rainMm: 15, turbidity: 58, humidity: 76, battery: 4.1, ext_wakeup: true, riskLabel: "Vigilancia", riskSummary: "Precipitaciones regulares" },
  
  // Nuevas 5 distribuidas por España
  { id: "sim-11", name: "Alicante", location: "Alicante", lat: 38.3452, lng: -0.4810, waterLevelCm: 65, rainMm: 2, turbidity: 20, humidity: 50, battery: 4.2, ext_wakeup: false, riskLabel: "Normal", riskSummary: "Sin incidencias" },
  { id: "sim-12", name: "Murcia", location: "Murcia", lat: 37.9922, lng: -1.1307, waterLevelCm: 70, rainMm: 5, turbidity: 30, humidity: 55, battery: 3.9, ext_wakeup: false, riskLabel: "Normal", riskSummary: "Caudal dentro de los márgenes" },
  { id: "sim-13", name: "Palma de Mallorca", location: "Palma", lat: 39.5696, lng: 2.6502, waterLevelCm: 85, rainMm: 12, turbidity: 45, humidity: 65, battery: 3.8, ext_wakeup: false, riskLabel: "Vigilancia", riskSummary: "Lluvias recientes" },
  { id: "sim-14", name: "Toledo", location: "Toledo", lat: 39.8628, lng: -4.0273, waterLevelCm: 60, rainMm: 1, turbidity: 25, humidity: 40, battery: 4.1, ext_wakeup: false, riskLabel: "Normal", riskSummary: "Situación estable" },
  { id: "sim-15", name: "Oviedo", location: "Oviedo", lat: 43.3619, lng: -5.8494, waterLevelCm: 105, rainMm: 22, turbidity: 60, humidity: 82, battery: 4.0, ext_wakeup: true, riskLabel: "Vigilancia", riskSummary: "Alta humedad y nivel al límite" },

  // Nuevas 5 en Galicia
  { id: "sim-16", name: "Lugo", location: "Lugo", lat: 43.0121, lng: -7.5558, waterLevelCm: 115, rainMm: 19, turbidity: 65, humidity: 85, battery: 3.7, ext_wakeup: true, riskLabel: "Vigilancia", riskSummary: "Caudal alto por lluvias en la sierra" },
  { id: "sim-17", name: "Ourense", location: "Ourense", lat: 42.3358, lng: -7.8639, waterLevelCm: 140, rainMm: 28, turbidity: 85, humidity: 88, battery: 3.6, ext_wakeup: true, riskLabel: "Alerta", riskSummary: "Riesgo inminente de desbordamiento" },
  { id: "sim-18", name: "Pontevedra", location: "Pontevedra", lat: 42.4310, lng: -8.6444, waterLevelCm: 125, rainMm: 25, turbidity: 70, humidity: 84, battery: 4.2, ext_wakeup: true, riskLabel: "Alerta", riskSummary: "Fuertes precipitaciones atlánticas" },
  { id: "sim-19", name: "Santiago de Compostela", location: "Santiago", lat: 42.8782, lng: -8.5448, waterLevelCm: 110, rainMm: 30, turbidity: 60, humidity: 90, battery: 4.0, ext_wakeup: true, riskLabel: "Vigilancia", riskSummary: "Lluvia intensa y constante" },
  { id: "sim-20", name: "Ferrol", location: "Ferrol", lat: 43.4832, lng: -8.2369, waterLevelCm: 100, rainMm: 18, turbidity: 55, humidity: 78, battery: 3.9, ext_wakeup: true, riskLabel: "Vigilancia", riskSummary: "Sistemas estables pero con alta precipitación" }
];
