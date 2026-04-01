import { cn } from "@/lib/utils/cn";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  narrow?: boolean;
}

export function Container({ children, className, narrow = false, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "container mx-auto px-4 sm:px-6 lg:px-8",
        narrow && "max-w-4xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
