import { LOGIN_MESSAGES } from "./utils";

export function LoginHeader() {
  return (
    <div className="space-y-3">
      <div className="inline-flex items-center gap-2 rounded-full bg-[color:var(--login-ink)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--login-cream)] shadow-md">
        <span className="h-2 w-2 rounded-full bg-[color:var(--login-accent)]" />
        {LOGIN_MESSAGES.BADGE}
      </div>

      <h1 className="login-font-display text-3xl sm:text-4xl font-semibold text-[color:var(--login-ink)] leading-tight">{LOGIN_MESSAGES.WELCOME}</h1>
      <p className="text-[color:var(--login-muted)] leading-relaxed">{LOGIN_MESSAGES.SUBTITLE}</p>
    </div>
  );
}
