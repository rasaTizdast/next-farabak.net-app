type JsonLdProps = {
  data: Record<string, unknown>;
  id?: string;
};

const Schema = ({ data, id = "json-ld" }: JsonLdProps) => {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export default Schema;
