import Image from "next/image";

export function PageHero({
  eyebrow,
  title,
  description,
  image
}: {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-bb-navy pb-20 pt-32 md:pb-32 md:pt-48">
      {image && (
        <div className="absolute inset-0 z-0">
          <Image
            src={image}
            alt={title}
            fill
            priority
            className="object-cover object-center"
          />
          {/* 35% dark overlay plus gradient for text readability */}
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-bb-navy via-transparent to-transparent opacity-90" />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center lg:px-8">
        <p className="inline-flex items-center rounded-full bg-bb-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-bb-gold ring-1 ring-inset ring-bb-gold/20 mb-6">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          {description}
        </p>
      </div>
    </section>
  );
}
