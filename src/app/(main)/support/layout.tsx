const SupportLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex w-full flex-col items-center px-6 py-4 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40">
      {children}
    </main>
  );
};

export default SupportLayout;
