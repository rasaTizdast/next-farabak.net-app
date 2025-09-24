interface ListProps {
  children: React.ReactNode;
}

export const UnorderedList: React.FC<ListProps> = ({ children }) => (
  <ul className="mb-4 list-inside list-disc pl-4">{children}</ul>
);

export const OrderedList: React.FC<ListProps> = ({ children }) => (
  <ol className="mb-4 list-inside list-decimal pl-4">{children}</ol>
);

export const ListItem: React.FC<ListProps> = ({ children }) => <li className="mb-2">{children}</li>;
