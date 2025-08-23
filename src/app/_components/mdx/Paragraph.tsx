interface ParagraphProps {
  children: React.ReactNode;
}

export const Paragraph: React.FC<ParagraphProps> = ({ children }) => (
  <p className="my-4 text-sm leading-relaxed text-gray-700 mobile:text-lg">{children}</p>
);
