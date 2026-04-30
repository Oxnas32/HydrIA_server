import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { TelemetryProvider } from "./context/TelemetryContext";
import { ViewModeProvider } from "./context/ViewModeContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppLayout from "./layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Stations from "./pages/Stations";
import StationDetail from "./pages/StationDetail";
import Alerts from "./pages/Alerts";
import HowItWorks from "./pages/HowItWorks";
import ProjectInfo from "./pages/ProjectInfo";

export default function App() {
  return (
    <ThemeProvider>
      <TelemetryProvider>
        <ViewModeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="stations" element={<Stations />} />
                <Route path="stations/:id" element={<StationDetail />} />
                <Route path="alerts" element={<Alerts />} />
                <Route path="how-it-works" element={<HowItWorks />} />
                <Route path="project" element={<ProjectInfo />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ViewModeProvider>
      </TelemetryProvider>
    </ThemeProvider>
  );
}