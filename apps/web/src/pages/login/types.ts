export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponse {
  sukses: boolean;
  data: {
    token: string;
    user: {
      id: number;
      nama: string;
      email: string;
      role: string;
    };
  };
  pesan?: string;
}

export interface LoginError {
  message: string;
  field?: "email" | "password" | "general";
}
