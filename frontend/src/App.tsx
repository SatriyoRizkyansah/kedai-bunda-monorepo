import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { BahanBakuPage } from "./pages/BahanBakuPage";
import { MenuPage } from "./pages/MenuPage";

function App() {
    const isAuthenticated = !!localStorage.getItem("token");

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/login"
                    element={
                        !isAuthenticated ? (
                            <LoginPage />
                        ) : (
                            <Navigate to="/dashboard" />
                        )
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        isAuthenticated ? (
                            <DashboardPage />
                        ) : (
                            <Navigate to="/login" />
                            // <DashboardPage />
                        )
                    }
                />
                <Route
                    path="/bahan-baku"
                    element={
                        isAuthenticated ? (
                            <BahanBakuPage />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/menu"
                    element={
                        isAuthenticated ? (
                            <MenuPage />
                        ) : (
                            <Navigate to="/login" />
                        )
                    }
                />
                <Route
                    path="/"
                    element={
                        <Navigate
                            to={isAuthenticated ? "/dashboard" : "/login"}
                        />
                    }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
