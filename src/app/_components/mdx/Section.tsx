interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ children, className = "" }) => (
  <section
    className={`my-6 rounded-lg bg-slate-100 p-4 text-sm leading-loose sm:p-5 sm:text-base ${className} last:mb-0`}
  >
    {children}
  </section>
);
