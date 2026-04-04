import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LoginFormData } from "./types";
import { LOGIN_MESSAGES, PLACEHOLDERS } from "./utils";

interface LoginFormProps {
  formData: LoginFormData;
  showPassword: boolean;
  error: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function LoginForm({ formData, showPassword, error, loading, onEmailChange, onPasswordChange, onTogglePassword, onSubmit }: LoginFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 sm:space-y-5">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-[color:var(--login-ink)]">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="h-12 rounded-2xl border border-[color:var(--login-border)] bg-white/85 px-4 text-[color:var(--login-ink)] placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[color:var(--login-accent)] focus-visible:border-[color:var(--login-accent)]"
          placeholder={PLACEHOLDERS.EMAIL}
          required
          disabled={loading}
        />
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-[color:var(--login-ink)]">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="h-12 rounded-2xl border border-[color:var(--login-border)] bg-white/85 px-4 pr-12 text-[color:var(--login-ink)] placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-[color:var(--login-accent)] focus-visible:border-[color:var(--login-accent)]"
            placeholder={PLACEHOLDERS.PASSWORD}
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-1.5 text-[color:var(--login-muted)] shadow-sm transition-colors hover:text-[color:var(--login-ink)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Login Button */}
      <Button
        type="submit"
        className="w-full h-12 rounded-2xl text-base font-semibold bg-[color:var(--login-accent)] text-white shadow-[0_14px_30px_rgba(240,138,60,0.35)] transition-all hover:bg-[color:var(--login-accent-deep)] disabled:opacity-70 disabled:shadow-none"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {LOGIN_MESSAGES.PROCESSING}
          </span>
        ) : (
          LOGIN_MESSAGES.LOGIN_BUTTON
        )}
      </Button>

      {/* Biometric Button */}
      {/* <Button type="button" variant="outline" className="w-full h-12 rounded-xl text-base font-medium border-gray-200 hover:bg-gray-50 transition-all gap-2" disabled>
        <Fingerprint className="h-5 w-5 text-primary" />
        {LOGIN_MESSAGES.BIOMETRIC_BUTTON}
      </Button> */}
    </form>
  );
}
