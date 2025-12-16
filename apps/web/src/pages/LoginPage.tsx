import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
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
        navigate("/dashboard");
      } else {
        setError(response.data.pesan || "Login gagal. Silakan coba lagi.");
      }
    } catch (err: any) {
      setError(err.response?.data?.pesan || "Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer
      left={
        <div className="space-y-8">
          <LoginHeader />
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
          <LoginFooter />
        </div>
      }
      right={<LoginImage />}
    />
  );
}

function LoginFooter() {
  return (
    <div className="pt-8 border-t border-gray-100 flex items-center justify-between text-sm text-gray-400">
      <span className="hover:text-gray-600 cursor-pointer transition-colors">{LOGIN_MESSAGES.SUPPORT}</span>
      <span>{LOGIN_MESSAGES.COPYRIGHT}</span>
    </div>
  );
}
