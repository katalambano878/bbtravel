import { cn } from "@/lib/utils/cn";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: "white" | "navy" | "neutral" | "transparent";
  spacing?: "normal" | "compact" | "none";
}

export function Section({ 
  children, 
  className, 
  variant = "white",
  spacing = "normal",
  ...props 
}: SectionProps) {
  
  const variants = {
    white: "bg-white text-bb-navy",
    navy: "bg-bb-navy text-white selection:bg-bb-gold/30 selection:text-white",
    neutral: "bg-bb-neutral text-bb-navy",
    transparent: "bg-transparent"
  };

  const spacings = {
    normal: "py-24 md:py-32",
    compact: "py-12 md:py-16",
    none: "py-0"
  };

  return (
    <section
      className={cn(
        "relative w-full overflow-hidden",
        variants[variant],
        spacings[spacing],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
