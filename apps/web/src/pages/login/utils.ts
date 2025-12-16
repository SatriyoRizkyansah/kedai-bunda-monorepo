import type { LoginFormData } from "./types";

// Validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validateLoginForm = (data: LoginFormData): string | null => {
  if (!data.email.trim()) {
    return "Email harus diisi";
  }

  if (!validateEmail(data.email)) {
    return "Format email tidak valid";
  }

  if (!data.password) {
    return "Password harus diisi";
  }

  if (!validatePassword(data.password)) {
    return "Password minimal 6 karakter";
  }

  return null;
};

// Constants
export const LOGIN_MESSAGES = {
  WELCOME: "Selamat Datang di Kedai Bunda!",
  SUBTITLE: "Mari mulai hari ini dengan senyuman dan layani pelanggan dengan sepenuh hati.",
  LOGIN_BUTTON: "Masuk",
  BIOMETRIC_BUTTON: "Gunakan Biometrik",
  PROCESSING: "Memproses...",
  SUPPORT: "Hubungi Support",
  COPYRIGHT: "© Kedai Bunda POS",
  QUOTE: '"Ga cuma jual makanan yang enak, kita juga jual rokok ilegal (tapi ga boleh ngutang)!"',
  AUTHOR: "Kedai Bunda",
  TAGLINE: "Melayani dengan Cinta 💕",
} as const;

// Placeholders
export const PLACEHOLDERS = {
  EMAIL: "nama@kedaibunda.com",
  PASSWORD: "••••••••",
} as const;
