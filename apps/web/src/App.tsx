import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { InventoriPage } from "./pages/InventoriPage";
import { MenuPage } from "./pages/MenuPage";
import { TransaksiPage } from "./pages/TransaksiPage";
import { StokLogPage } from "./pages/StokLogPage";
import { LaporanPage } from "./pages/LaporanPage";
import { ThemeSettingsPage } from "./pages/ThemeSettingsPage";
import { UsersPage } from "./pages/UsersPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useGlobalThemeShortcut } from "./hooks/useGlobalThemeShortcut";
import { Toaster } from "sonner";

function AppRoutes() {
  // Enable global theme shortcut (Ctrl + Arrow Right)
  useGlobalThemeShortcut();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventori"
        element={
          <ProtectedRoute requiredRole={["admin", "super_admin", "kasir"]}>
            <InventoriPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/menu"
        element={
          <ProtectedRoute requiredRole={["admin", "super_admin"]}>
            <MenuPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/transaksi"
        element={
          <ProtectedRoute requiredRole={["kasir", "super_admin"]}>
            <TransaksiPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stok-log"
        element={
          <ProtectedRoute>
            <StokLogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/laporan"
        element={
          <ProtectedRoute requiredRole={["admin", "super_admin"]}>
            <LaporanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/theme-settings"
        element={
          <ProtectedRoute>
            <ThemeSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requiredRole="super_admin">
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <Toaster richColors position="top-right" closeButton duration={3000} />
    </ThemeProvider>
  );
}

export default App;
