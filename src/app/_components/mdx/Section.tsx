interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = "",
}) => (
  <section
    className={`text-sm sm:text-base bg-slate-100 rounded-lg p-4 sm:p-5 my-6 leading-loose ${className} last:mb-0`}
  >
    {children}
  </section>
);
