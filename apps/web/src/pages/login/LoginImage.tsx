import { LOGIN_MESSAGES } from "./utils";
import storeImage from "@/assets/store.jpg";

interface LoginImageProps {
  variant?: "full" | "compact";
}

export function LoginImage({ variant = "full" }: LoginImageProps) {
  const isCompact = variant === "compact";
  const patternId = isCompact ? "login-grid-compact" : "login-grid-full";

  return (
    <div className={isCompact ? "relative h-48 sm:h-60 overflow-hidden rounded-3xl shadow-[0_18px_50px_rgba(16,16,16,0.25)]" : "w-full h-full relative overflow-hidden"}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={storeImage} alt="Kedai Bunda" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
      </div>

      {/* Pattern (subtle) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" className="w-full h-full">
          <defs>
            <pattern id={patternId} width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      </div>

      {isCompact ? (
        <div className="relative z-10 flex h-full flex-col justify-end gap-3 p-5 text-white">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--login-ink)] shadow-sm">{LOGIN_MESSAGES.BADGE}</div>
          <h2 className="login-font-display text-xl sm:text-2xl leading-tight">{LOGIN_MESSAGES.WELCOME}</h2>
          <p className="text-sm text-white/80 leading-snug">{LOGIN_MESSAGES.QUOTE}</p>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col justify-end items-end h-full px-12 py-20">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-sm text-[color:var(--login-ink)]">
            <p className="text-lg leading-relaxed mb-6">{LOGIN_MESSAGES.QUOTE}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[color:var(--login-accent)]/15 flex items-center justify-center">
                <svg className="h-5 w-5 text-[color:var(--login-accent-deep)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.025-2-6-2s-6 .75-6 2c0 1 0 4 1 6h6c0 1-1 2-2 2s-4-.5-4-3 1-4 6-4 6 2.5 6 4v5c0 1-1 2-2 2s-4-.5-4-3 1-4 6-4 6 2.5 6 4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">{LOGIN_MESSAGES.AUTHOR}</p>
                <p className="text-sm text-[color:var(--login-muted)]">{LOGIN_MESSAGES.TAGLINE}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
