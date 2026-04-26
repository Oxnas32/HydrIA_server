#!/usr/bin/env python3
import tkinter as tk
from tkinter import messagebox, simpledialog, ttk
import manage  # Directly import the CLI logic

def add_new_item_gui():
    nodeId = simpledialog.askstring("Add Node", "Enter Node ID (e.g., A4):")
    if not nodeId: return
    nodeId = nodeId.strip()
    
    nodes = manage.get_app_nodes()
    if nodeId in nodes:
        messagebox.showerror("Error", f"Node ID '{nodeId}' already exists. Use Update instead.")
        return
        
    site = simpledialog.askstring("Add Node", "Enter Site Name:")
    if site is None: return
    province = simpledialog.askstring("Add Node", "Enter Province:")
    if province is None: return
    
    try:
        lat_str = simpledialog.askstring("Add Node", "Enter Latitude (e.g. 42.24):")
        if lat_str is None: return
        lat = float(lat_str or 0)
        
        lng_str = simpledialog.askstring("Add Node", "Enter Longitude (e.g. -8.72):")
        if lng_str is None: return
        lng = float(lng_str or 0)
        
        water_str = simpledialog.askstring("Add Node", "Enter Water Level (cm):")
        if water_str is None: return
        water = float(water_str or 0)
        
        rain_str = simpledialog.askstring("Add Node", "Enter Rain (mm):")
        if rain_str is None: return
        rain = float(rain_str or 0)
        
        turb_str = simpledialog.askstring("Add Node", "Enter Turbidity (NTU):")
        if turb_str is None: return
        turbidity = float(turb_str or 0)
        
        hum_str = simpledialog.askstring("Add Node", "Enter Humidity (%):")
        if hum_str is None: return
        humidity = float(hum_str or 0)
    except ValueError:
        messagebox.showerror("Error", "All telemetry values must be numbers.")
        return

    manage.post_telemetry({
        "nodeId": nodeId.strip(),
        "site": site.strip(),
        "province": province.strip(),
        "lat": lat,
        "lng": lng,
        "waterLevelCm": water,
        "rainMm": rain,
        "turbidity": turbidity,
        "humidity": humidity
    })
    messagebox.showinfo("Success", f"Node {nodeId} addition command safely sent to API.")

def update_existing_item_gui():
    nodes = manage.get_app_nodes()
    if not nodes:
        messagebox.showerror("Error", "No nodes found in the app. Aborting update.")
        return
        
    nodeId = simpledialog.askstring("Update Node", f"Available Nodes: {', '.join(nodes)}\n\nWhich Node ID to update?:")
    if not nodeId: return
    nodeId = nodeId.strip()
    
    if nodeId not in nodes:
        messagebox.showerror("Error", f"Node '{nodeId}' is not registered.")
        return
        
    latest = manage.get_latest_data(nodeId)
    
    def_site = latest.get("site") or "Unknown"
    def_prov = latest.get("province") or "Unknown"
    def_lat = latest.get("lat") or 0.0
    def_lng = latest.get("lng") or 0.0
    def_water = latest.get("waterLevelCm") or 0.0
    def_rain = latest.get("rainMm") or 0.0
    def_turb = latest.get("turbidity") or 0.0
    def_hum = latest.get("humidity") or 0.0
    
    site = simpledialog.askstring("Update Node", f"Enter Site Name for {nodeId}:", initialvalue=def_site)
    if site is None: return
    province = simpledialog.askstring("Update Node", "Enter Province:", initialvalue=def_prov)
    if province is None: return
    
    try:
        lat_str = simpledialog.askstring("Update Node", "Enter new Latitude:", initialvalue=str(def_lat))
        if lat_str is None: return
        lat = float(lat_str)
        
        lng_str = simpledialog.askstring("Update Node", "Enter new Longitude:", initialvalue=str(def_lng))
        if lng_str is None: return
        lng = float(lng_str)
        
        water_str = simpledialog.askstring("Update Node", "Enter new Water Level (cm):", initialvalue=str(def_water))
        if water_str is None: return
        water = float(water_str)
        
        rain_str = simpledialog.askstring("Update Node", "Enter new Rain (mm):", initialvalue=str(def_rain))
        if rain_str is None: return
        rain = float(rain_str)
        
        turb_str = simpledialog.askstring("Update Node", "Enter new Turbidity (NTU):", initialvalue=str(def_turb))
        if turb_str is None: return
        turbidity = float(turb_str)
        
        hum_str = simpledialog.askstring("Update Node", "Enter new Humidity (%):", initialvalue=str(def_hum))
        if hum_str is None: return
        humidity = float(hum_str)
    except ValueError:
        messagebox.showerror("Error", "All telemetry values must be numbers.")
        return

    payload = {
        "nodeId": nodeId,
        "site": site.strip(),
        "province": province.strip(),
        "waterLevelCm": water,
        "rainMm": rain,
        "turbidity": turbidity,
        "humidity": humidity,
        "lat": lat,
        "lng": lng
    }
        
    manage.post_telemetry(payload)
    messagebox.showinfo("Success", f"Node {nodeId} update command efficiently relayed to API.")

def remove_existing_item_gui():
    nodes = manage.get_app_nodes()
    if not nodes:
        messagebox.showinfo("Info", "No dynamic nodes found to remove.")
        return
        
    nodeId = simpledialog.askstring("Remove Node", f"Available Nodes: {', '.join(nodes)}\n\nEnter Node ID to wipe from DB:")
    if not nodeId: return
    nodeId = nodeId.strip()
    
    confirm = messagebox.askyesno("Confirm Delete", f"Are you sure you want to completely erase telemetry for node {nodeId}?")
    if confirm:
        manage.influx_delete(f'_measurement="telemetry" AND nodeId="{nodeId}"')
        messagebox.showinfo("Data Deleted", f"Node {nodeId} sequence has been cleanly eradicated from InfluxDB.")

def remove_all_database_gui():
    confirm1 = messagebox.askyesno("WARNING: CRITICAL DELETION", "This will completely erase the entire InfluxDB telemetry bucket for all nodes natively.\n\nAre you sure you wish to proceed?")
    if confirm1:
        ans = simpledialog.askstring("Final Confirmation Verification", "Type 'CONFIRM' below to physically execute this deletion command:")
        if ans == "CONFIRM":
            manage.influx_delete('_measurement="telemetry"')
            messagebox.showinfo("Bucket Wiped", "The entire Influx database bucket has been flattened.")
        else:
            messagebox.showinfo("Safety Core Abort", "Invalid confirmation. Data has been protected.")

def main():
    root = tk.Tk()
    root.title("HydrIA Terminal Operations")
    root.geometry("450x380")
    root.configure(padx=25, pady=25)
    
    tk.Label(root, text="HydrIA Telemetry GUI Manager", font=("Inter", 16, "bold")).pack(pady=(0, 25))
    
    style = ttk.Style()
    style.configure("TButton", font=("Inter", 12), padding=12)
    
    ttk.Button(root, text="➕ Add New Node Item", command=add_new_item_gui).pack(fill=tk.X, pady=6)
    ttk.Button(root, text="🔄 Update Existing Target", command=update_existing_item_gui).pack(fill=tk.X, pady=6)
    ttk.Button(root, text="🗑️ Remove Isolated Item", command=remove_existing_item_gui).pack(fill=tk.X, pady=6)
    
    wipe_btn = tk.Button(root, text="⚠️ WIPE ALL DATABASE", font=("Inter", 12, "bold"), fg="white", bg="#8b0000", command=remove_all_database_gui, pady=10)
    wipe_btn.pack(fill=tk.X, pady=20)
    
    root.mainloop()

if __name__ == "__main__":
    main()
