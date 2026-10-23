/**
 * Rafi9i — SectionHeading
 * Orange eyebrow + confident ink heading + optional short description.
 */

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
  /** Id on the heading, for `aria-labelledby` on the parent section. */
  id?: string;
  /** "dark" when the section sits on a dark band. */
  tone?: "light" | "dark";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  as: Tag = "h2",
  id,
  tone = "light",
  className = "",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-start";
  const dark = tone === "dark";
  return (
    <div className={`flex flex-col gap-3 ${alignment} ${className}`}>
      {eyebrow && (
        <span className={`text-xs font-bold uppercase tracking-[0.14em] ${dark ? "text-orange-400" : "text-orange-600 dark:text-orange-400"}`}>
          {eyebrow}
        </span>
      )}
      <Tag
        id={id}
        className={`max-w-3xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl lg:leading-[1.1] ${
          dark ? "text-white" : "text-slate-950 dark:text-white"
        }`}
      >
        {title}
      </Tag>
      {description && (
        <p
          className={`max-w-2xl text-base leading-relaxed sm:text-lg ${align === "center" ? "mx-auto" : ""} ${
            dark ? "text-slate-400" : "text-slate-600 dark:text-slate-400"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
