const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center w-24 h-24">
        <div className="w-10 h-10 border-4 border-[#0e6aff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
