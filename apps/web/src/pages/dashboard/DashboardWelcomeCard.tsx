import Lottie from "lottie-react";
import { Clock, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import cookingAnimation from "@/components/loader/cooking-animation.json";
import { getGreeting } from "./utils";

interface DashboardWelcomeCardProps {
  userName?: string;
}

export function DashboardWelcomeCard({ userName }: DashboardWelcomeCardProps) {
  return (
    <Card className="relative overflow-hidden border border-border/40 bg-gradient-to-br from-emerald-50 via-background to-amber-50 dark:from-emerald-950/40 dark:via-background dark:to-amber-950/30">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute -top-16 -right-10 h-40 w-40 rounded-full bg-emerald-300/30 blur-3xl dark:bg-emerald-900/40" />
      <CardContent className="relative p-4 sm:p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 flex-shrink-0">
            <Lottie animationData={cookingAnimation} loop className="w-full h-full" />
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full text-xs sm:text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              <span>{getGreeting()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight">
              Selamat Datang, <span className="text-emerald-600 dark:text-emerald-300">{userName?.split(" ")[0] || "Admin"}</span>! 👋
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl">Kelola bisnis kuliner Anda dengan mudah. Pantau stok bahan baku, kelola menu, dan lihat laporan penjualan dalam satu dashboard yang lengkap.</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <div className="hidden sm:inline-flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-500/10 dark:text-emerald-300 rounded-full px-2.5 py-1">Tips: Update stok sebelum jam sibuk</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
