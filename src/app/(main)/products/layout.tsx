import styles from "./ProductsLayout.module.css";

const ProductsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className={styles.main}>
      <section className={styles.section}>{children}</section>
    </main>
  );
};

export default ProductsLayout;
