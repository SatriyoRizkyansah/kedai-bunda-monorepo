import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

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
