import { LOGIN_MESSAGES } from "./utils";

export function LoginHeader() {
  return (
    <div className="space-y-2">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <div className="w-5 h-3 rounded-full bg-primary/60"></div>
          <div className="w-3 h-3 rounded-full bg-primary"></div>
        </div>
      </div>

      {/* Welcome Text */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{LOGIN_MESSAGES.WELCOME}</h1>
      <p className="text-gray-500">{LOGIN_MESSAGES.SUBTITLE}</p>
    </div>
  );
}
