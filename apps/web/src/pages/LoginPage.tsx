import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UtensilsCrossed, Eye, EyeOff, Fingerprint } from "lucide-react";
import api from "@/lib/api";
import storeImage from "@/assets/store.jpg";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });

      if (response.data.sukses) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.pesan || "Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <div className="w-5 h-3 rounded-full bg-primary/60"></div>
              <div className="w-3 h-3 rounded-full bg-primary"></div>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Selamat Datang di Kedai Bunda!</h1>
            <p className="text-gray-500">Mari mulai hari ini dengan senyuman dan layani pelanggan dengan sepenuh hati.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary" placeholder="nama@kedaibunda.com" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary pr-12"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-base font-medium bg-primary hover:bg-primary/90 transition-all" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </Button>

            <Button type="button" variant="outline" className="w-full h-12 rounded-xl text-base font-medium border-gray-200 hover:bg-gray-50 transition-all gap-2" disabled>
              <Fingerprint className="h-5 w-5 text-primary" />
              Gunakan Biometrik
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
            <span className="hover:text-gray-600 cursor-pointer transition-colors">Hubungi Support</span>
            <span>© Kedai Bunda POS</span>
          </div>
        </div>
      </div>

      {/* Right Side - Image & Quote */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src={storeImage} alt="Kedai Bunda" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        </div>

        {/* Quote Card */}
        <div className="relative z-10 flex flex-col justify-end p-12 w-full">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-lg">
            {/* Quote Text */}
            <p className="text-gray-700 text-lg leading-relaxed mb-6">"Ga cuma jual makanan yang enak, kita juga jual rokok ilegal (tapi ga boleh ngutang)!"</p>

            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Kedai Bunda</p>
                <p className="text-sm text-gray-500">Melayani dengan Cinta 💕</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
