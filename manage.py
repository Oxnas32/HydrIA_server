#!/usr/bin/env python3
import json
import urllib.request
import re
import os
import datetime

# Configuration
API_URL = "http://localhost:3001/telemetry"
INFLUX_URL = "http://localhost:8086/api/v2/delete?org=hydria&bucket=telemetry"
INFLUX_TOKEN = "HYDRIA_DEV_TOKEN_1234567890"

# Find mock file independent of where script runs from
DIR_PATH = os.path.dirname(os.path.realpath(__file__))
MOCK_FILE = os.path.join(DIR_PATH, "web", "frontend", "src", "mock.ts")

def get_app_nodes():
    """Extract valid Node IDs from the backend stations endpoint."""
    valid_ids = []
    try:
        req = urllib.request.Request("http://localhost:3001/stations")
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            data = json.loads(res_body)
            if data and data.get("ok"):
                for stat in data.get("data", []):
                    if "id" in stat:
                        valid_ids.append(stat["id"])
    except Exception as e:
        print(f"[!] Could not hit backend to fetch nodes: {e}")
    return list(set(valid_ids))

def post_telemetry(data):
    """Hits the local API which validates and safely pushes to InfluxDB"""
    try:
        req = urllib.request.Request(API_URL, method="POST")
        req.add_header("Content-Type", "application/json")
        encoded_data = json.dumps(data).encode("utf-8")
        with urllib.request.urlopen(req, data=encoded_data) as response:
            res_body = response.read().decode("utf-8")
            if response.status == 200:
                print(f"[+] Success: {res_body}")
            else:
                print(f"[!] Failed (Status {response.status}): {res_body}")
    except urllib.error.HTTPError as e:
        print(f"[!] HTTP Error during insertion (Validation failed?): {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"[!] System Error: API might be down. Did you run start.sh? ({e})")

def get_latest_data(nodeId):
    try:
        req = urllib.request.Request(f"http://localhost:3001/latest?nodeId={nodeId}")
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            data = json.loads(res_body)
            if data and data.get("ok"):
                return data
    except Exception:
        pass
    return {}

def get_string(prompt, default_val=None):
    prompt_str = f"{prompt} [{default_val}]: " if default_val is not None else prompt
    val = input(prompt_str).strip()
    if not val and default_val is not None:
        return default_val
    return val

def get_float(prompt, default_val=None):
    prompt_str = f"{prompt} [{default_val}]: " if default_val is not None else prompt
    while True:
        val = input(prompt_str).strip()
        if not val and default_val is not None:
            return float(default_val)
        try:
            return float(val)
        except ValueError:
            print("    Please enter a valid number.")

def add_new_item():
    print("\n--- Add New Item ---")
    nodeId = input("Enter Node ID (e.g., A4): ").strip()
    
    nodes = get_app_nodes()
    if nodeId in nodes:
        print(f"[!] Error: Node ID '{nodeId}' already exists. Please use 'Update existing item' instead.")
        return
        
    site = input("Enter Site Name: ").strip()
    province = input("Enter Province: ").strip()
    lat = get_float("Enter Latitude (e.g. 42.24): ")
    lng = get_float("Enter Longitude (e.g. -8.72): ")
    water = get_float("Enter Water Level (cm): ")
    rain = get_float("Enter Rain (mm): ")
    turbidity = get_float("Enter Turbidity (NTU): ")
    humidity = get_float("Enter Humidity (%): ")
    battery = get_float("Enter Battery (V): ")
    
    ext_str = input("Enter Ext Wakeup (true/false, default false): ").strip().lower()
    ext_wakeup = True if ext_str == "true" else False
    
    post_telemetry({
        "nodeId": nodeId,
        "site": site,
        "province": province,
        "lat": lat,
        "lng": lng,
        "waterLevelCm": water,
        "rainMm": rain,
        "turbidity": turbidity,
        "humidity": humidity,
        "battery": battery,
        "ext_wakeup": ext_wakeup
    })

def update_existing_item():
    print("\n--- Update Existing Item ---")
    nodes = get_app_nodes()
    
    if not nodes:
        print("[!] No nodes found in the app. Aborting update.")
        return
        
    print(f"Available App-Level Nodes: {', '.join(nodes)}")
    nodeId = input("Which Node ID to update?: ").strip()
    
    if nodeId not in nodes:
        print(f"[!] Error: Node '{nodeId}' is not registered at the app level. Please add it to mock.ts first.")
        return
        
    print(f"Proceeding to update {nodeId}...")

    # Pre-fetch existing values from DB logic to retain unchanged fields
    latest = get_latest_data(nodeId)
    
    def_site = latest.get("site") or "Unknown"
    def_prov = latest.get("province") or "Unknown"
    def_lat = latest.get("lat")
    def_lng = latest.get("lng")
    def_water = latest.get("waterLevelCm")
    def_rain = latest.get("rainMm")
    def_turb = latest.get("turbidity")
    def_hum = latest.get("humidity")
    def_batt = latest.get("battery")
    def_ext = latest.get("ext_wakeup")

    site = get_string(f"Enter Site Name for {nodeId}", def_site)
    province = get_string(f"Enter Province", def_prov)
    lat = get_float("Enter new Latitude", def_lat)
    lng = get_float("Enter new Longitude", def_lng)
    water = get_float("Enter new Water Level (cm)", def_water)
    rain = get_float("Enter new Rain (mm)", def_rain)
    turbidity = get_float("Enter new Turbidity (NTU)", def_turb)
    humidity = get_float("Enter new Humidity (%)", def_hum)
    battery = get_float("Enter new Battery (V)", def_batt)
    
    ext_str = input(f"Enter new Ext Wakeup (true/false) [{def_ext}]: ").strip().lower()
    ext_wakeup = def_ext
    if ext_str == "true": ext_wakeup = True
    elif ext_str == "false": ext_wakeup = False
    
    payload = {
        "nodeId": nodeId,
        "site": site,
        "province": province,
        "waterLevelCm": water,
        "rainMm": rain,
        "turbidity": turbidity,
        "humidity": humidity
    }
    if battery is not None: payload["battery"] = battery
    if ext_wakeup is not None: payload["ext_wakeup"] = ext_wakeup
    if lat is not None: payload["lat"] = lat
    if lng is not None: payload["lng"] = lng
        
    post_telemetry(payload)

def influx_delete(predicate):
    """Strictly deletes points from InfluxDB matching the predicate."""
    try:
        now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        payload = {
            "start": "1970-01-01T00:00:00Z",
            "stop": now,
            "predicate": predicate
        }
        
        req = urllib.request.Request(INFLUX_URL, method="POST")
        req.add_header("Authorization", f"Token {INFLUX_TOKEN}")
        req.add_header("Content-Type", "application/json")
        encoded_data = json.dumps(payload).encode("utf-8")
        
        with urllib.request.urlopen(req, data=encoded_data) as response:
            if response.status == 204:
                print(f"[+] Successfully removed items matching: {predicate}")
                try:
                    notify_req = urllib.request.Request("http://localhost:3001/telemetry/notify_delete", method="POST")
                    notify_req.add_header("Content-Type", "application/json")
                    node_match = re.search(r'nodeId="([^"]+)"', predicate)
                    payload = { "all": node_match is None }
                    if node_match: payload["nodeId"] = node_match.group(1)
                    with urllib.request.urlopen(notify_req, data=json.dumps(payload).encode("utf-8")) as exp_res:
                        pass
                except Exception as e:
                    pass # SSE notification failure is non-fatal
            else:
                print(f"[!] Failed to delete (Status {response.status})")
    except urllib.error.HTTPError as e:
        print(f"[!] InfluxDB HTTP Error: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"[!] System Error: Is InfluxDB running? ({e})")

def remove_existing_item():
    print("\n--- Remove Existing Item ---")
    nodeId = input("Enter Node ID to wipe from the database (e.g., A1): ").strip()
    if not nodeId:
        print("Aborted.")
        return
    influx_delete(f'_measurement="telemetry" AND nodeId="{nodeId}"')

def remove_all_database():
    print("\n--- WARNING: WIPE ALL TELEMETRY ---")
    print("This will completely erase the entire InfluxDB telemetry bucket.")
    ans = input("Type 'CONFIRM' to execute: ")
    if ans == "CONFIRM":
        influx_delete('_measurement="telemetry"')
    else:
        print("[!] Aborted. Data is safe.")

def main():
    while True:
        print("\n===============================")
        print(" HydrIA Terminal Manager (v1)")
        print("===============================")
        print("1. Add new item")
        print("2. Update existing app item")
        print("3. Remove existing item")
        print("4. Remove ALL database")
        print("5. Clear screen")
        print("6. Exit")
        choice = input("Select an option (1-6): ").strip()
        
        if choice == "1":
            add_new_item()
        elif choice == "2":
            update_existing_item()
        elif choice == "3":
            remove_existing_item()
        elif choice == "4":
            remove_all_database()
        elif choice == "5":
            os.system("clear")
        elif choice == "6":
            print("Exiting...")
            break
        else:
            print("Invalid option. Try again.")

if __name__ == "__main__":
    main()
