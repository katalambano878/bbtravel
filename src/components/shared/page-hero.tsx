export function PageHero({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="section-shell">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-semibold text-bb-navy md:text-5xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-lg text-slate-600">{description}</p>
      </div>
    </section>
  );
}
