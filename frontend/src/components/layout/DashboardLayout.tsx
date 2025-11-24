import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Home,
    Package,
    ShoppingCart,
    UtensilsCrossed,
    LogOut,
    User,
    Receipt,
    Users,
    ChevronDown,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import type { User as UserType } from "@/lib/types";

interface NavbarProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: NavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState<UserType | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        }
    };

    const menuItems = [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/bahan-baku", label: "Bahan Baku", icon: Package },
        { href: "/menu", label: "Menu", icon: UtensilsCrossed },
        { href: "/transaksi", label: "Transaksi", icon: ShoppingCart },
        { href: "/riwayat", label: "Riwayat", icon: Receipt },
    ];

    // Add Users menu only for super_admin
    if (user?.role === "super_admin") {
        menuItems.push({
            href: "/users",
            label: "Pengguna",
            icon: Users,
        });
    }

    const isActive = (path: string) => location.pathname === path;

    const getUserInitials = () => {
        if (!user?.name) return "U";
        return user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Horizontal Navbar di Atas */}
            <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center gap-6">
                        {/* Logo */}
                        <div className="flex items-center gap-2 mr-2">
                            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                                <UtensilsCrossed className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-primary">
                                    Kedai Bunda
                                </h1>
                                <p className="text-xs text-muted-foreground">
                                    Sistem Kasir
                                </p>
                            </div>
                        </div>

                        {/* Menu Navigasi - Horizontal */}
                        <nav className="hidden md:flex items-center gap-1 flex-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <Link key={item.href} to={item.href}>
                                        <Button
                                            variant={
                                                active ? "default" : "ghost"
                                            }
                                            className="gap-2"
                                            size="sm"
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-2 h-auto p-2"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                            {getUserInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-sm font-medium">
                                            {user?.name || "User"}
                                        </p>
                                        <p className="text-xs text-muted-foreground capitalize">
                                            {user?.role === "super_admin"
                                                ? "Super Admin"
                                                : "Admin"}
                                        </p>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {user?.name}
                                        </p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Keluar</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
