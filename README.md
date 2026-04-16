# HydRIA Server

HydRIA is an end-to-end telemetry dashboard and API designed to track water levels, rainfall, battery voltages, and risk statuses from remote sensor nodes.

## System Architecture

1. **Frontend**: React + Vite (Port `5173`)
2. **Backend**: Node.js + Express (Port `3001`)
3. **Database**: InfluxDB v2 (Aggregates geographic tags and telemetry)
4. **Admin CLI**: Python `manage.py` script for live database CRUD ops.

---

## First-Time Installation

Before starting the server, you must install the local Node environments for both the API and the React interface.

1. **Install Backend Dependencies**

   ```bash
   cd web/api
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

---

## Running the Application

Once dependencies are installed, you can use the integrated launch script to start both the API and the Frontend seamlessly:

```bash
# Return to the root directory
cd ../../
./start.sh
```

- **Frontend Application:** `http://localhost:5174` (or `5173`)
- **Backend API Server:** `http://localhost:3001`

_(To cleanly shut down both servers simultaneously, just press `Ctrl+C` in the terminal)._

---

## Administration & Data Seeding

To easily manage system telemetry or provision new sensor nodes across the map, use the interactive Python command-line utility.

_Ensure your `INFLUX_TOKEN` is correctly exported in your environment._

```bash
python3 manage.py
```

This utility allows you to locally:

- Add a new physical Node (coordinates, province) to the map.
- Safely update telemetry strings for an existing item (changes instantly auto-propagate to React via SSE).
- Remove stray data nodes entirely.
- Perform an emergency Influx bucket wipe.
