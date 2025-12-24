import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Package, ShoppingCart, UtensilsCrossed, LogOut, Users, ChevronDown, Menu, BarChart3 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import api from "@/lib/api";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import type { User as UserType } from "@/lib/types";

interface NavbarProps {
  children: React.ReactNode;
}

// Memoized Navbar Component untuk mencegah re-render
const Navbar = memo(({ user, isActive, handleLogout, menuItems }: { user: UserType | null; isActive: (path: string) => boolean; handleLogout: () => void; menuItems: Array<{ href: string; label: string; icon: any }> }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <header
      className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/95"
      style={{
        boxShadow: "var(--shadow-md)",
        minHeight: "64px",
        maxHeight: "64px",
      }}
    >
      <div className="container mx-auto px-4" style={{ maxWidth: "100%", width: "100%" }}>
        <div className="flex h-16 items-center gap-3" style={{ minHeight: "64px" }}>
          {/* Hamburger Menu Button - Visible when menu would overflow (mobile & small tablets) */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  <span>Menu Navigasi</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link key={item.href} to={item.href} onClick={() => setSidebarOpen(false)}>
                      <Button
                        variant={active ? "default" : "ghost"}
                        className="w-full justify-start gap-3"
                        style={{
                          borderRadius: "calc(var(--radius) - 2px)",
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="bg-primary text-primary-foreground p-2 rounded-lg"
              style={{
                borderRadius: "var(--radius)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div className="hidden sm:block mr-5">
              <h1 className="text-base md:text-lg font-bold text-primary tracking-tight whitespace-nowrap">Kedai Bunda</h1>
              <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">Sistem Kasir POS</p>
            </div>
          </div>

          {/* Menu Navigasi - Horizontal (Desktop) - Show all when space available */}
          <nav className="hidden lg:flex items-center gap-1 flex-1" style={{ minWidth: 0 }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} to={item.href} style={{ display: "inline-flex" }}>
                  <Button
                    variant={active ? "default" : "ghost"}
                    className="gap-2 whitespace-nowrap"
                    size="sm"
                    style={{
                      borderRadius: "calc(var(--radius) - 2px)",
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1 lg:hidden" />

          {/* Spacer */}
          <div className="flex-1 lg:hidden" />

          {/* Theme Switcher - Hide on small screens */}
          <div className="hidden md:block shrink-0">
            <ThemeSwitcher />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-auto p-2 hover:bg-accent shrink-0"
                style={{
                  borderRadius: "var(--radius)",
                }}
              >
                <Avatar
                  className="h-8 w-8"
                  style={{
                    borderRadius: "calc(var(--radius) - 2px)",
                  }}
                >
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium text-foreground whitespace-nowrap">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground capitalize whitespace-nowrap">{user?.role === "super_admin" ? "Super Admin" : "Admin"}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56"
              style={{
                borderRadius: "var(--radius)",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* Theme Switcher for Mobile */}
              <div className="md:hidden px-2 py-2">
                <ThemeSwitcher />
              </div>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
});

Navbar.displayName = "Navbar";

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

  const handleLogout = useCallback(async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // useMemo untuk mencegah re-render navbar
  const menuItems = useMemo(() => {
    const baseItems = [{ href: "/dashboard", label: "Dashboard", icon: Home }];

    // Inventory and Menu - only for admin and super_admin
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      baseItems.push({ href: "/inventori", label: "Inventori", icon: Package }, { href: "/menu", label: "Menu", icon: UtensilsCrossed });
    }

    // Transaksi - only for kasir and super_admin
    if (user && (user.role === "super_admin" || (user.role as any) === "kasir")) {
      baseItems.push({ href: "/transaksi", label: "Transaksi", icon: ShoppingCart });
    }

    // Laporan - only for admin and super_admin
    if (user && (user.role === "admin" || user.role === "super_admin")) {
      baseItems.push({ href: "/laporan", label: "Laporan", icon: BarChart3 });
    }

    // Add Users menu only for super_admin
    if (user?.role === "super_admin") {
      baseItems.push({
        href: "/users",
        label: "Pengguna",
        icon: Users,
      });
    }

    return baseItems;
  }, [user?.role]);

  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ minHeight: "100vh" }}>
      {/* Horizontal Navbar di Atas - Memoized */}
      <Navbar user={user} isActive={isActive} handleLogout={handleLogout} menuItems={menuItems} />

      {/* Main Content */}
      <main className="flex-1 bg-background page-transition">
        <div className="container mx-auto px-4 py-6" style={{ minHeight: "calc(100vh - 160px)" }}>
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card" style={{ minHeight: "64px" }}>
        <div className="container mx-auto px-4 py-4" style={{ maxWidth: "100%", width: "100%" }}>
          <p className="text-center text-sm text-muted-foreground">© 2025 Kedai Bunda. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
