const ProductsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex w-full flex-col items-center px-[10rem] py-12 md:px-[6rem] lg:px-[4rem] xl:px-[3rem] 2xl:px-[1.5rem]">
      <section className="w-full max-w-[calc(1900px-20rem)]">{children}</section>
    </main>
  );
};

export default ProductsLayout;
