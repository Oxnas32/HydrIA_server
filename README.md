# HydRIA Server

HydRIA is an end-to-end telemetry dashboard and API designed to track water levels, rainfall, turbidity, humidity, and risk statuses from remote sensor nodes.

## System Architecture

1. **Frontend**: React + Vite (Port `5173`)
2. **Backend**: Node.js + Express (Port `3001`)
3. **Database**: InfluxDB v2 (Aggregates geographic tags and telemetry)
4. **Admin Interfaces**: Python architecture containing both Terminal environments (`manage.py`) and standalone Desktop GUI environments (`manage_gui.py`) for live database interactions.

---

## First-Time Installation

Before starting the server, you must install the packages required by both the Node backend and the React framework.

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

Once dependencies are installed locally, you can use the integrated launch script to safely start both the API and the Frontend simultaneously:

```bash
# Return to the root directory
cd ../../
./start.sh
```

- **Frontend Application:** `http://localhost:5174` (or `5173`)
- **Backend API Server:** `http://localhost:3001`

*(To cleanly shut down both background servers simultaneously, just press `Ctrl+C` inside the running terminal).*

---

## Administration & Data Seeding

To quickly inject node data, override sensor telemetry, or entirely wipe nodes across the local network without physical hardware, use the integrated Python manager scripts.

*Note: You must have `./start.sh` running in the background before opening these tools, because they rely on Port 3001 to sync with the React layout!*

### Option A: Standard Terminal Application
```bash
python3 manage.py
```

### Option B: Visual Desktop Interface Manager
If you prefer managing the internal database natively through floating control panels, automated dropdown menus, and visual confirm guards, open the GUI:

```bash
# Note: Linux users must install python3-tk before this window can render geometry.
# (sudo apt-get install python3-tk)

python3 manage_gui.py
```

These administrative tools safely allow you to:
- Add an entirely new sensor Node manually into the active environment map.
- Provide fake telemetry values for an existing item to mimic changes on the frontend dynamically.
- Eradicate nodes entirely from the InfluxDB engine.
- Sanitize the entire deployment via an emergency Influx database drop.
