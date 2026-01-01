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
    <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <CardContent className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
            <Lottie animationData={cookingAnimation} loop className="w-full h-full" />
          </div>

          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>{getGreeting()}</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
              Selamat Datang, <span className="text-primary">{userName?.split(" ")[0] || "Admin"}</span>! 👋
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl">Kelola bisnis kuliner Anda dengan mudah. Pantau stok bahan baku, kelola menu, dan lihat laporan penjualan dalam satu dashboard yang lengkap.</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
