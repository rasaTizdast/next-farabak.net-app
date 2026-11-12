import { publicShellClasses } from "@/components/public/PublicShell";

const ProductsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="w-full py-4">
      <section className={publicShellClasses}>{children}</section>
    </main>
  );
};

export default ProductsLayout;
