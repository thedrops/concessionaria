import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  variant?: "full" | "small";
}

export default function Logo({
  className = "",
  width,
  height,
  variant = "small",
}: LogoProps) {
  const defaultWidth = variant === "full" ? 200 : 120;
  const defaultHeight = variant === "full" ? 200 : 120;

  return (
    <Image
      src="/logo.jpg"
      alt="Israel Veículos - Há mais de 42 anos crescendo com o Litoral Norte"
      width={width || defaultWidth}
      height={height || defaultHeight}
      className={className}
      priority
    />
  );
}
