import type { ReactNode } from "react";

export function SectionContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1680px] px-5 glg:pr-16 glg:pl-80 ${className}`}>
      {children}
    </div>
  );
}
