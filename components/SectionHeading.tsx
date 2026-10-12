interface Props {
  label: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  as?: "h1" | "h2";
  aside?: React.ReactNode;
}

/** Small amber mono label → large serif title → content (§7.6). */
export function SectionHeading({ label, title, intro, as: Tag = "h2", aside }: Props) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p className="label-amber">{label}</p>
        <Tag className={`heading-serif mt-4 ${Tag === "h1" ? "text-5xl md:text-6xl" : "text-4xl md:text-5xl"}`}>{title}</Tag>
        {intro && <div className="mt-5 max-w-2xl text-base leading-relaxed">{intro}</div>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}
