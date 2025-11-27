import Lottie from "lottie-react";
import cookingLoader from "./loader/cooking-loader.json";

interface LoadingScreenProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export const LoadingScreen = ({ message = "Memuat data...", size = "md" }: LoadingScreenProps) => {
  const sizeMap = {
    sm: 150,
    md: 250,
    lg: 350,
  };

  return (
    <div className="flex flex-col items-center justify-center py-12" style={{ minHeight: "400px" }}>
      <Lottie
        animationData={cookingLoader}
        loop={true}
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
        }}
      />
      <p className="text-muted-foreground mt-4 text-center" style={{ fontFamily: "var(--font-sans)" }}>
        {message}
      </p>
    </div>
  );
};
