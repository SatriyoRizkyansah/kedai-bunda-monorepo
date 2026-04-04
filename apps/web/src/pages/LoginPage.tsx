import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { notify } from "@/lib/notify";
import type { LoginFormData, LoginResponse } from "./login";
import { LOGIN_MESSAGES, validateLoginForm } from "./login/utils";
import { LoginContainer } from "./login/LoginContainer";
import { LoginHeader } from "./login/LoginHeader";
import { LoginForm } from "./login/LoginForm";
import { LoginImage } from "./login/LoginImage";

export function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (value: string) => {
    setFormData((prev) => ({ ...prev, email: value }));
    setError("");
  };

  const handlePasswordChange = (value: string) => {
    setFormData((prev) => ({ ...prev, password: value }));
    setError("");
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form
    const validationError = validateLoginForm(formData);
    if (validationError) {
      setError(validationError);
      notify.error(validationError, { duration: 5000 });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<LoginResponse>("/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.sukses) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        notify.success("Login berhasil! Selamat datang...", { duration: 2000 });
        // Delay sebelum navigate supaya user lihat toast
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        const errorMsg = response.data.pesan || "Login gagal. Silakan coba lagi.";
        setError(errorMsg);
        notify.error(errorMsg, { duration: 5000 });
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMsg = err.response?.data?.pesan || err.message || "Login gagal. Silakan coba lagi.";
      setError(errorMsg);
      notify.error(errorMsg, { duration: 5000 });
      setLoading(false);
    }
  };

  return (
    <LoginContainer
      hero={<LoginImage variant="compact" />}
      left={
        <div className="space-y-6 sm:space-y-8">
          <LoginHeader />
          <div className="rounded-3xl border border-white/70 bg-white/85 p-5 sm:p-7 shadow-[0_20px_60px_rgba(15,15,15,0.12)] backdrop-blur-xl">
            <LoginForm
              formData={formData}
              showPassword={showPassword}
              error={error}
              loading={loading}
              onEmailChange={handleEmailChange}
              onPasswordChange={handlePasswordChange}
              onTogglePassword={handleTogglePassword}
              onSubmit={handleSubmit}
            />
          </div>
          <LoginFooter />
        </div>
      }
      right={<LoginImage />}
    />
  );
}

function LoginFooter() {
  return (
    <div className="pt-6 border-t border-white/70 flex flex-col gap-3 text-xs sm:text-sm text-[color:var(--login-muted)] sm:flex-row sm:items-center sm:justify-between">
      <button type="button" className="text-left font-semibold text-[color:var(--login-ink)] hover:text-[color:var(--login-accent-deep)] transition-colors">
        {LOGIN_MESSAGES.SUPPORT}
      </button>
      <span>{LOGIN_MESSAGES.COPYRIGHT}</span>
    </div>
  );
}
