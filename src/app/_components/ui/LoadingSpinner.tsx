const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-white p-6 shadow-md">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0e6aff] border-t-transparent"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
