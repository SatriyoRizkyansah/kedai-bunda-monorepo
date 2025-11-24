import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Home,
    Package,
    ShoppingCart,
    UtensilsCrossed,
    LogOut,
    User,
} from "lucide-react";

interface NavbarProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: NavbarProps) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Horizontal Navbar di Atas */}
            <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                                <UtensilsCrossed className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-primary">
                                    Kedai Bunda
                                </h1>
                                <p className="text-xs text-muted-foreground">
                                    Sistem Kasir & Stok
                                </p>
                            </div>
                        </div>

                        {/* Menu Navigasi */}
                        <nav className="hidden md:flex items-center gap-2">
                            <Link to="/dashboard">
                                <Button variant="ghost" className="gap-2">
                                    <Home className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link to="/menu">
                                <Button variant="ghost" className="gap-2">
                                    <UtensilsCrossed className="h-4 w-4" />
                                    Menu
                                </Button>
                            </Link>
                            <Link to="/bahan-baku">
                                <Button variant="ghost" className="gap-2">
                                    <Package className="h-4 w-4" />
                                    Bahan Baku
                                </Button>
                            </Link>
                            <Link to="/transaksi">
                                <Button variant="ghost" className="gap-2">
                                    <ShoppingCart className="h-4 w-4" />
                                    Transaksi
                                </Button>
                            </Link>
                        </nav>

                        {/* User Info & Logout */}
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
                                <User className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                    {user.nama || "User"}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden md:inline">Keluar</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 bg-gray-50">
                <div className="container mx-auto px-4 py-6">{children}</div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-white">
                <div className="container mx-auto px-4 py-4">
                    <p className="text-center text-sm text-muted-foreground">
                        © 2025 Kedai Bunda. Semua hak dilindungi.
                    </p>
                </div>
            </footer>
        </div>
    );
}
