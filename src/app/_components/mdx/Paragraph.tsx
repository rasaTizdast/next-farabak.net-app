interface ParagraphProps {
  children: React.ReactNode;
}

export const Paragraph: React.FC<ParagraphProps> = ({ children }) => (
  <p className="text-sm mobile:text-lg text-gray-700 leading-relaxed my-4">{children}</p>
);
