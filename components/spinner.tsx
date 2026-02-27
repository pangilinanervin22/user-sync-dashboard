"use client";

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className = "h-4 w-4" }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`${className} animate-spin inline-block`}
      style={{
        backgroundColor: "currentColor",
        maskImage: "url(/spinner.svg)",
        maskSize: "100% 100%",
        WebkitMaskImage: "url(/spinner.svg)",
        WebkitMaskSize: "100% 100%",
      }}
    />
  );
}
