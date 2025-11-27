import Lottie from "lottie-react";
import cookingLoader from "./loader/cooking-loader.json";

interface FullPageLoaderProps {
  message?: string;
}

export const FullPageLoader = ({ message = "Memuat..." }: FullPageLoaderProps) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <Lottie
          animationData={cookingLoader}
          loop={true}
          style={{
            width: 300,
            height: 300,
          }}
        />
        <p className="text-lg font-medium text-foreground mt-4" style={{ fontFamily: "var(--font-sans)" }}>
          {message}
        </p>
      </div>
    </div>
  );
};
