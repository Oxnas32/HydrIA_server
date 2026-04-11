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

let sseClients = [];
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send an initial ping just to confirm connection
  res.write("data: {\"type\": \"ping\"}\n\n");

  sseClients.push(res);

  req.on("close", () => {
    sseClients = sseClients.filter((client) => client !== res);
  });
});

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "hydria-api", time: new Date().toISOString() });
});

app.get("/stations", (req, res) => {
  const q = flux`from(bucket: "${INFLUX_BUCKET}")
    |> range(start: -30d)
    |> filter(fn: (r) => r._measurement == "telemetry")
    |> group(columns: ["nodeId", "_field"])
    |> last()`;

  const rows = [];
  queryApi.queryRows(q, {
    next: (row, tableMeta) => rows.push(tableMeta.toObject(row)),
    error: (err) => res.status(500).json({ ok: false, error: String(err) }),
    complete: () => {
      const stationsMap = {};
      for (const r of rows) {
        if (!stationsMap[r.nodeId]) {
          stationsMap[r.nodeId] = { id: r.nodeId };
        }
        stationsMap[r.nodeId].time = r._time;
        if (r.site) stationsMap[r.nodeId].name = r.site;
        if (r._field === "waterLevelCm") stationsMap[r.nodeId].waterLevelCm = r._value;
        if (r._field === "rainMm") stationsMap[r.nodeId].rainMm = r._value;
        if (r._field === "batteryV") stationsMap[r.nodeId].battery = r._value;
        if (r._field === "lat") stationsMap[r.nodeId].lat = r._value;
        if (r._field === "lng") stationsMap[r.nodeId].lng = r._value;
        if (r.province) stationsMap[r.nodeId].province = r.province;
      }
      
      const results = Object.values(stationsMap);
      
      for (const s of results) {
        let risk = "OK";
        if (s.waterLevelCm && s.waterLevelCm > 150) risk = "WARN";
        if (s.waterLevelCm && s.waterLevelCm > 200) risk = "ALERT";
        s.risk = risk;
        s.updated = "ahora mismo";
      }
      
      res.json({ ok: true, data: results });
    }
  });
});

app.get("/latest", (req, res) => {
  const reqNodeId = req.query.nodeId || "A1";
  const q = flux`from(bucket: "${INFLUX_BUCKET}")
    |> range(start: -24h)
    |> filter(fn: (r) => r._measurement == "telemetry")
    |> filter(fn: (r) => r.nodeId == "${reqNodeId}")
    |> group(columns: ["nodeId", "_field"])
    |> last()`;

  const rows = [];

  queryApi.queryRows(q, {
    next: (row, tableMeta) => rows.push(tableMeta.toObject(row)),
    error: (err) => res.status(500).json({ ok: false, error: String(err) }),
    complete: () => {
      const out = {
        ok: true,
        nodeId: reqNodeId,
        site: "Unknown",
        time: null,
        waterLevelCm: null,
        rainMm: null,
        batteryV: null,
      };

      for (const r of rows) {
        out.time = r._time;
        if (r.site) out.site = r.site;
        if (r._field === "waterLevelCm") out.waterLevelCm = r._value;
        if (r._field === "rainMm") out.rainMm = r._value;
        if (r._field === "batteryV") out.batteryV = r._value;
        if (r._field === "lat") out.lat = r._value;
        if (r._field === "lng") out.lng = r._value;
        if (r.province) out.province = r.province;
        if (r.nodeId) out.nodeId = r.nodeId;
        if (r.site) out.site = r.site;
      }

      res.json(out);
    },
  });
});

app.post("/telemetry/notify_delete", (req, res) => {
  const { nodeId, all } = req.body;
  const payload = { 
    ok: true, 
    source: "database", 
    action: all ? "delete_all" : "delete", 
    nodeId: nodeId 
  };
  sseClients.forEach((client) => {
    client.write(`data: ${JSON.stringify(payload)}\n\n`);
  });
  res.json({ ok: true });
});
app.post("/telemetry", async (req, res) => {
  const { nodeId, site, waterLevelCm, rainMm, batteryV, lat, lng, province } = req.body;

  const errors = [];

  if (typeof nodeId !== "string" || !nodeId.trim()) {
    errors.push("'nodeId' must be a non-empty string.");
  }
  if (typeof site !== "string" || !site.trim()) {
    errors.push("'site' must be a non-empty string.");
  }
  if (typeof waterLevelCm !== "number" || isNaN(waterLevelCm)) {
    errors.push("'waterLevelCm' must be a valid number.");
  }
  if (typeof rainMm !== "number" || isNaN(rainMm)) {
    errors.push("'rainMm' must be a valid number.");
  }
  if (typeof batteryV !== "number" || isNaN(batteryV)) {
    errors.push("'batteryV' must be a valid number.");
  }
  if (lat !== undefined && (typeof lat !== "number" || isNaN(lat))) {
    errors.push("'lat' must be a numeric latitude.");
  }
  if (lng !== undefined && (typeof lng !== "number" || isNaN(lng))) {
    errors.push("'lng' must be a numeric longitude.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ ok: false, error: "Invalid data format", details: errors });
  }

  const p = new Point("telemetry")
    .tag("nodeId", String(nodeId))
    .tag("site", String(site))
    .floatField("waterLevelCm", Number(waterLevelCm))
    .floatField("rainMm", Number(rainMm))
    .floatField("batteryV", Number(batteryV));
    
  if (lat !== undefined) p.floatField("lat", Number(lat));
  if (lng !== undefined) p.floatField("lng", Number(lng));
  if (province) p.tag("province", String(province));

  p.timestamp(new Date());

  writeApi.writePoint(p);

  try {
    // Wait for the point to be written to the database
    await writeApi.flush();

    // Now read the same data back
    const q = flux`from(bucket: "${INFLUX_BUCKET}")
      |> range(start: -1m)
      |> filter(fn: (r) => r._measurement == "telemetry")
      |> filter(fn: (r) => r.nodeId == "${nodeId}")
      |> group(columns: ["nodeId", "_field"])
      |> last()`;

    const rows = [];
    queryApi.queryRows(q, {
      next: (row, tableMeta) => rows.push(tableMeta.toObject(row)),
      error: (err) => res.status(500).json({ ok: false, error: "Read error", details: String(err) }),
      complete: () => {
        const out = {
          nodeId: nodeId,
          site: site,
          time: null,
          waterLevelCm: null,
          rainMm: null,
          batteryV: null,
        };

        for (const r of rows) {
          out.time = r._time;
          if (r.site) out.site = r.site;
          if (r._field === "waterLevelCm") out.waterLevelCm = r._value;
          if (r._field === "rainMm") out.rainMm = r._value;
          if (r._field === "batteryV") out.batteryV = r._value;
          if (r._field === "lat") out.lat = r._value;
          if (r._field === "lng") out.lng = r._value;
          if (r.province) out.province = r.province;
        }

        // Return the exact data read from the database
        const payload = { ok: true, source: "database", data: out };
        
        // Push the new data to all connected frontend clients
        sseClients.forEach((client) => {
          client.write(`data: ${JSON.stringify(payload)}\n\n`);
        });

        res.json(payload);
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: "Write error", details: String(err) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));