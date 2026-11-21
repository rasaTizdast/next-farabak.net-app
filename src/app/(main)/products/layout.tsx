import { publicShellClasses } from "@/components/public/PublicShell";

const ProductsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full py-4">
      <section className={publicShellClasses}>{children}</section>
    </div>
  );
};

export default ProductsLayout;
