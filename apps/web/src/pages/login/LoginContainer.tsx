import type { ReactNode } from "react";

interface LoginContainerProps {
  left: ReactNode;
  right: ReactNode;
}

export function LoginContainer({ left, right }: LoginContainerProps) {
  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">{left}</div>
      </div>

      {/* Right Side - Image (hidden on mobile, visible on lg) */}
      <div className="hidden lg:flex lg:w-1/2 h-full">{right}</div>
    </div>
  );
}
