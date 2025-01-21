interface ListProps {
  children: React.ReactNode;
}

export const UnorderedList: React.FC<ListProps> = ({ children }) => (
  <ul className="list-disc list-inside mb-4 pl-4">{children}</ul>
);

export const OrderedList: React.FC<ListProps> = ({ children }) => (
  <ol className="list-decimal list-inside mb-4 pl-4">{children}</ol>
);

export const ListItem: React.FC<ListProps> = ({ children }) => (
  <li className="mb-2">{children}</li>
);
