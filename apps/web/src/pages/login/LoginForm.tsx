import { Eye, EyeOff, Fingerprint } from "lucide-react";
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
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Email Input */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary"
          placeholder={PLACEHOLDERS.EMAIL}
          required
          disabled={loading}
        />
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="h-12 rounded-xl border-gray-200 focus:border-primary focus:ring-primary pr-12"
            placeholder={PLACEHOLDERS.PASSWORD}
            required
            disabled={loading}
          />
          <button type="button" onClick={onTogglePassword} disabled={loading} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Login Button */}
      <Button type="submit" className="w-full h-12 rounded-xl text-base font-medium bg-primary hover:bg-primary/90 transition-all" disabled={loading}>
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
      <Button type="button" variant="outline" className="w-full h-12 rounded-xl text-base font-medium border-gray-200 hover:bg-gray-50 transition-all gap-2" disabled>
        <Fingerprint className="h-5 w-5 text-primary" />
        {LOGIN_MESSAGES.BIOMETRIC_BUTTON}
      </Button>
    </form>
  );
}
