import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import Stations from "./pages/Stations";
import StationDetail from "./pages/StationDetail";
import Alerts from "./pages/Alerts";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/stations/:id" element={<StationDetail />} />
          <Route path="/alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}