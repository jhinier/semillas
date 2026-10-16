import * as React from "react";

interface PropiedadesEscudoSVG {
  fill: string;
  stroke: string;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

export const EscudoSVG: React.FC<PropiedadesEscudoSVG> = ({
  fill,
  stroke,
  strokeWidth = 4,
  className,
  children,
}) => {
  return (
    <svg
      viewBox="0 0 100 115"
      className={className ?? "w-full h-full"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 0C77.7778 0 95.8333 13.5833 100 40.8333C100 78.4333 75.9259 102.35 50 115C24.0741 102.35 0 78.4333 0 40.8333C4.16667 13.5833 22.2222 0 50 0Z"
        fill={fill}
      />
      <path
        d="M50 4C74.7778 4 91.8333 16.5833 96 42.8333C96 75.4333 73.9259 97.35 50 109C26.0741 97.35 4 75.4333 4 42.8333C8.16667 16.5833 25.2222 4 50 4Z"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
      {children}
    </svg>
  );
};
