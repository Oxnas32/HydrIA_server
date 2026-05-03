const express = require("express");
const cors = require("cors");
const { InfluxDB, Point, flux } = require("@influxdata/influxdb-client");
const { evaluateRisk } = require("./riskEngine");

const INFLUX_URL = "http://127.0.0.1:8086";
const INFLUX_TOKEN = "HYDRIA_DEV_TOKEN_1234567890";
const INFLUX_ORG = "hydria";
const INFLUX_BUCKET = "telemetry";

const influx = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });

const writeApi = influx.getWriteApi(INFLUX_ORG, INFLUX_BUCKET);
writeApi.useDefaultTags({ app: "HydrIA" });

const queryApi = influx.getQueryApi(INFLUX_ORG);

const app = express();
app.use(cors());
app.use(express.json());

function getRecentHistory(nodeId) { // esta función obtiene el historial de las últimas 6 horas para un nodo específico, agrupando los datos por timestamp y asegurándose de que cada registro contenga los campos relevantes (waterLevelCm, rainMm, turbidity, humidity). Luego ordena los registros por tiempo y devuelve solo los últimos 8 registros para su análisis en la función de evaluación de riesgo.
  return new Promise((resolve, reject) => {
    const q = flux`from(bucket: "${INFLUX_BUCKET}")
      |> range(start: -6h)
      |> filter(fn: (r) => r._measurement == "telemetry")
      |> filter(fn: (r) => r.nodeId == "${nodeId}")
      |> filter(fn: (r) => r._field == "waterLevelCm" or r._field == "rainMm" or r._field == "turbidity" or r._field == "humidity" or r._field == "battery" or r._field == "ext_wakeup")
      |> sort(columns: ["_time"])`;

    const rows = [];

    queryApi.queryRows(q, {
      next: (row, tableMeta) => rows.push(tableMeta.toObject(row)),
      error: (err) => reject(err),
      complete: () => {
        const historyMap = {};

        for (const r of rows) {
          const time = r._time;

          if (!historyMap[time]) {
            historyMap[time] = {
              time,
              waterLevelCm: null,
              rainMm: null,
              turbidity: null,
              humidity: null,
            };
          }

          if (r._field === "waterLevelCm") historyMap[time].waterLevelCm = r._value;
          if (r._field === "rainMm") historyMap[time].rainMm = r._value;
          if (r._field === "turbidity") historyMap[time].turbidity = r._value;
          if (r._field === "humidity") historyMap[time].humidity = r._value;
          if (r._field === "battery") historyMap[time].battery = r._value;
          if (r._field === "ext_wakeup") historyMap[time].ext_wakeup = r._value;
        }

        const result = Object.values(historyMap).sort(
          (a, b) => new Date(a.time) - new Date(b.time)
        );

        resolve(result.slice(-8));
      },
    });
  });
}

let sseClients = [];

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  res.write('data: {"type":"ping"}\n\n');

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
        if (r._field === "turbidity") stationsMap[r.nodeId].turbidity = r._value;
        if (r._field === "humidity") stationsMap[r.nodeId].humidity = r._value;
        if (r._field === "lat") stationsMap[r.nodeId].lat = r._value;
        if (r._field === "lng") stationsMap[r.nodeId].lng = r._value;
        if (r._field === "battery") stationsMap[r.nodeId].battery = r._value;
        if (r._field === "ext_wakeup") stationsMap[r.nodeId].ext_wakeup = r._value;
        if (r.province) stationsMap[r.nodeId].province = r.province;
      }

      const results = Object.values(stationsMap);

      for (const s of results) {
        const riskResult = evaluateRisk(
          {
            waterLevelCm: s.waterLevelCm,
            rainMm: s.rainMm,
            turbidity: s.turbidity,
            humidity: s.humidity,
          },
          []
        );

        s.risk = riskResult.risk;
        s.riskLabel = riskResult.label;
        s.riskScore = riskResult.score;
        s.riskSummary = riskResult.summary;
        s.riskReasons = riskResult.reasons;
        s.updated = "ahora mismo";
      }

      res.json({ ok: true, data: results });
    },
  });
});

app.get("/stations/:id/history", (req, res) => {
  const stationId = req.params.id;

  const q = flux`from(bucket: "${INFLUX_BUCKET}")
    |> range(start: -24h)
    |> filter(fn: (r) => r._measurement == "telemetry")
    |> filter(fn: (r) => r.nodeId == "${stationId}")`;

  const rows = [];

  queryApi.queryRows(q, {
    next: (row, tableMeta) => rows.push(tableMeta.toObject(row)),
    error: (err) => res.status(500).json({ ok: false, error: String(err) }),
    complete: () => {
      const historyMap = {};

      for (const r of rows) {
        const time = r._time;

        if (!historyMap[time]) {
          historyMap[time] = {
            time,
            waterLevelCm: null,
            rainMm: null,
            turbidity: null,
            humidity: null,
          };
        }

        if (r._field === "waterLevelCm") historyMap[time].waterLevelCm = r._value;
        if (r._field === "rainMm") historyMap[time].rainMm = r._value;
        if (r._field === "turbidity") historyMap[time].turbidity = r._value;
        if (r._field === "humidity") historyMap[time].humidity = r._value;
        if (r._field === "battery") historyMap[time].battery = r._value;
        if (r._field === "ext_wakeup") historyMap[time].ext_wakeup = r._value;
      }

      const result = Object.values(historyMap).sort(
        (a, b) => new Date(a.time) - new Date(b.time)
      );

      res.json({ ok: true, data: result });
    },
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
        turbidity: null,
        humidity: null,
        battery: null,
        ext_wakeup: null,
      };

      for (const r of rows) {
        out.time = r._time;
        if (r.site) out.site = r.site;
        if (r._field === "waterLevelCm") out.waterLevelCm = r._value;
        if (r._field === "rainMm") out.rainMm = r._value;
        if (r._field === "turbidity") out.turbidity = r._value;
        if (r._field === "humidity") out.humidity = r._value;
        if (r._field === "lat") out.lat = r._value;
        if (r._field === "lng") out.lng = r._value;
        if (r._field === "battery") out.battery = r._value;
        if (r._field === "ext_wakeup") out.ext_wakeup = r._value;
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
    nodeId,
  };

  sseClients.forEach((client) => {
    client.write(`data: ${JSON.stringify(payload)}\n\n`);
  });

  res.json({ ok: true });
});

app.post("/telemetry", async (req, res) => {
  const { 
    nodeId, site, waterLevelCm, rainMm, turbidity, humidity, lat, lng, province,
    node_id, sonar_cm, intensity_mm_h, battery, ext_wakeup 
  } = req.body;

  const actualNodeId = nodeId || node_id;
  const actualWaterLevel = waterLevelCm ?? sonar_cm;
  const actualRain = rainMm ?? intensity_mm_h;
  const actualTurbidity = turbidity;
  const actualHumidity = humidity;

  const errors = [];

  if (typeof actualNodeId !== "string" || !actualNodeId.trim()) {
    errors.push("'nodeId' (or 'node_id') must be a non-empty string.");
  }
  if (typeof actualWaterLevel !== "number" || isNaN(actualWaterLevel)) {
    errors.push("'waterLevelCm' (or 'sonar_cm') must be a valid number.");
  }
  if (actualRain !== undefined && (typeof actualRain !== "number" || isNaN(actualRain))) {
    errors.push("'rainMm' (or 'intensity_mm_h') must be a valid number.");
  }
  if (typeof actualTurbidity !== "number" || isNaN(actualTurbidity)) {
    errors.push("'turbidity' must be a valid number.");
  }
  if (typeof actualHumidity !== "number" || isNaN(actualHumidity)) {
    errors.push("'humidity' must be a valid number.");
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

  let finalSite = site;
  let finalProvince = province;

  if (!finalSite) {
    const q = flux`from(bucket: "${INFLUX_BUCKET}")
      |> range(start: -30d)
      |> filter(fn: (r) => r._measurement == "telemetry" and r.nodeId == "${actualNodeId}")
      |> last()`;
    const rows = [];
    try {
      await new Promise((resolve, reject) => {
        queryApi.queryRows(q, {
          next: (row, tableMeta) => rows.push(tableMeta.toObject(row)),
          error: reject,
          complete: resolve
        });
      });
      for (const r of rows) {
        if (r.site && !finalSite) finalSite = r.site;
        if (r.province && !finalProvince) finalProvince = r.province;
      }
    } catch (e) {
      console.error("Error fetching previous metadata:", e);
    }
  }

  if (!finalSite) finalSite = "Unknown";

  const p = new Point("telemetry")
    .tag("nodeId", String(actualNodeId))
    .tag("site", String(finalSite))
    .floatField("waterLevelCm", Number(actualWaterLevel))
    .floatField("turbidity", Number(actualTurbidity))
    .floatField("humidity", Number(actualHumidity));

  if (actualRain !== undefined) p.floatField("rainMm", Number(actualRain));
  if (battery !== undefined) p.floatField("battery", Number(battery));
  if (ext_wakeup !== undefined) p.booleanField("ext_wakeup", Boolean(ext_wakeup));

  if (lat !== undefined) p.floatField("lat", Number(lat));
  if (lng !== undefined) p.floatField("lng", Number(lng));
  if (finalProvince) p.tag("province", String(finalProvince));

  p.timestamp(new Date());

  writeApi.writePoint(p);

  try {
    await writeApi.flush();

    const history = await getRecentHistory(nodeId);

    const riskResult = evaluateRisk(
      {
        waterLevelCm,
        rainMm,
        turbidity,
        humidity,
      },
      history
    );

    const q = flux`from(bucket: "${INFLUX_BUCKET}")
      |> range(start: -1m)
      |> filter(fn: (r) => r._measurement == "telemetry")
      |> filter(fn: (r) => r.nodeId == "${nodeId}")
      |> group(columns: ["nodeId", "_field"])
      |> last()`;

    const rows = [];

    queryApi.queryRows(q, {
      next: (row, tableMeta) => rows.push(tableMeta.toObject(row)),
      error: (err) =>
        res.status(500).json({ ok: false, error: "Read error", details: String(err) }),
      complete: () => {
        const out = {
          nodeId,
          site,
          time: null,
          waterLevelCm: null,
          rainMm: null,
          turbidity: null,
          humidity: null,
          battery: null,
          ext_wakeup: null,
          risk: null,
          riskLabel: null,
          riskScore: null,
          riskSummary: null,
          riskReasons: [],
        };

        for (const r of rows) {
          out.time = r._time;
          if (r.site) out.site = r.site;
          if (r._field === "waterLevelCm") out.waterLevelCm = r._value;
          if (r._field === "rainMm") out.rainMm = r._value;
          if (r._field === "turbidity") out.turbidity = r._value;
          if (r._field === "humidity") out.humidity = r._value;
          if (r._field === "lat") out.lat = r._value;
          if (r._field === "lng") out.lng = r._value;
          if (r._field === "battery") out.battery = r._value;
          if (r._field === "ext_wakeup") out.ext_wakeup = r._value;
          if (r.province) out.province = r.province;
        }

        out.risk = riskResult.risk;
        out.riskLabel = riskResult.label;
        out.riskScore = riskResult.score;
        out.riskSummary = riskResult.summary;
        out.riskReasons = riskResult.reasons;

        const payload = { ok: true, source: "database", data: out };

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