import { LOGIN_MESSAGES } from "./utils";
import storeImage from "@/assets/store.jpg";

export function LoginImage() {
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={storeImage} alt="Kedai Bunda" className="w-full h-full object-cover" />
        {/* gradient overlay to darken image for white text on top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      {/* Pattern (subtle) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Quote Card */}
      <div className="relative z-10 flex flex-col justify-end items-end h-full px-12 py-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-sm text-gray-900">
          <p className="text-lg leading-relaxed mb-6">{LOGIN_MESSAGES.QUOTE}</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-4.025-2-6-2s-6 .75-6 2c0 1 0 4 1 6h6c0 1-1 2-2 2s-4-.5-4-3 1-4 6-4 6 2.5 6 4v5c0 1-1 2-2 2s-4-.5-4-3 1-4 6-4 6 2.5 6 4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">{LOGIN_MESSAGES.AUTHOR}</p>
              <p className="text-sm text-gray-500">{LOGIN_MESSAGES.TAGLINE}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
