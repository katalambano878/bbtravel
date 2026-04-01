import { cn } from "@/lib/utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl space-y-5", className)}>
      {eyebrow ? (
        <p className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-bb-gold">
          <span className="h-px w-8 bg-bb-gold/50" />
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-4xl font-bold tracking-tight text-bb-navy md:text-5xl lg:text-5xl leading-[1.15]">
        {title}
      </h2>
      {description ? (
        <p className="text-lg font-light leading-relaxed text-slate-600 md:text-xl max-w-2xl">
          {description}
        </p>
      ) : null}
    </div>
  );
}
