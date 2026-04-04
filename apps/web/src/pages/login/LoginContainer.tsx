import type { ReactNode } from "react";

interface LoginContainerProps {
  left: ReactNode;
  right: ReactNode;
  hero?: ReactNode;
}

export function LoginContainer({ left, right, hero }: LoginContainerProps) {
  return (
    <div className="login-shell relative min-h-screen overflow-hidden bg-[color:var(--login-cream)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 right-[-120px] h-72 w-72 rounded-full bg-[color:var(--login-accent)]/25 blur-3xl" />
        <div className="absolute -bottom-32 left-[-120px] h-80 w-80 rounded-full bg-[color:var(--login-sage)]/60 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#ffffff_0,_transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(120deg,_#000000_0%,_transparent_35%,_#000000_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Left Side - Form */}
        <div className="flex w-full items-center justify-center px-5 py-6 sm:px-8 sm:py-10 lg:w-1/2 lg:p-12">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
            {hero ? (
              <div className="lg:hidden animate-fade-in" style={{ animationDelay: "40ms" }}>
                {hero}
              </div>
            ) : null}
            <div className="animate-fade-in" style={{ animationDelay: "120ms" }}>
              {left}
            </div>
          </div>
        </div>

        {/* Right Side - Image (hidden on mobile, visible on lg) */}
        <div className="hidden lg:flex lg:w-1/2">{right}</div>
      </div>
    </div>
  );
}
