const express = require("express");
const cors = require("cors");
const { InfluxDB, Point, flux } = require("@influxdata/influxdb-client");

const INFLUX_URL = "http://127.0.0.1:8086";
const INFLUX_TOKEN = "HYDRIA_DEV_TOKEN_1234567890";
const INFLUX_ORG = "hydria";
const INFLUX_BUCKET = "telemetry";

const influx = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });

// Write API (telemetría)
const writeApi = influx.getWriteApi(INFLUX_ORG, INFLUX_BUCKET);
writeApi.useDefaultTags({ app: "HydrIA" });

// Query API (lecturas para dashboard)
const queryApi = influx.getQueryApi(INFLUX_ORG);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "hydria-api", time: new Date().toISOString() });
});

app.get("/latest", (req, res) => {
  // (por ahora fijo a A1, luego lo haremos dinámico con ?nodeId=A1)
  const q = flux`from(bucket: ${INFLUX_BUCKET})
    |> range(start: -24h)
    |> filter(fn: (r) => r._measurement == "telemetry")
    |> filter(fn: (r) => r.nodeId == "A1")
    |> last()`;

  const rows = [];

  queryApi.queryRows(q, {
    next: (row, tableMeta) => rows.push(tableMeta.toObject(row)),
    error: (err) => res.status(500).json({ ok: false, error: String(err) }),
    complete: () => {
      const out = {
        ok: true,
        nodeId: "A1",
        site: "Vigo",
        time: null,
        waterLevelCm: null,
        rainMm: null,
        batteryV: null,
      };

      for (const r of rows) {
        out.time = r._time; // mismo timestamp para los 3 fields (normalmente)
        if (r._field === "waterLevelCm") out.waterLevelCm = r._value;
        if (r._field === "rainMm") out.rainMm = r._value;
        if (r._field === "batteryV") out.batteryV = r._value;
        if (r.nodeId) out.nodeId = r.nodeId;
        if (r.site) out.site = r.site;
      }

      res.json(out);
    },
  });
});

app.post("/telemetry", (req, res) => {
  const { nodeId, site, waterLevelCm, rainMm, batteryV } = req.body;

  const p = new Point("telemetry")
    .tag("nodeId", String(nodeId))
    .tag("site", String(site))
    .floatField("waterLevelCm", Number(waterLevelCm))
    .floatField("rainMm", Number(rainMm))
    .floatField("batteryV", Number(batteryV))
    .timestamp(new Date());

  writeApi.writePoint(p);

  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));