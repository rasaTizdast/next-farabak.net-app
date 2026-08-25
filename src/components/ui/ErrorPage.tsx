interface ErrorPageProps {
  title?: string;
  message?: string;
  statusCode?: number;
  onRetry?: () => void;
}

export function ErrorPage({
  title = "خطا",
  message = "خطایی رخ داده است",
  statusCode,
  onRetry,
}: ErrorPageProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="bg-primary/10 rounded-full p-6">
        <span className="text-primary text-4xl">⚠</span>
      </div>
      {statusCode && <span className="text-dark-blue text-6xl font-bold">{statusCode}</span>}
      <h1 className="text-dark-blue text-2xl font-bold">{title}</h1>
      <p className="text-gray-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-primary hover:bg-secondary rounded-lg px-6 py-2 text-white"
        >
          تلاش مجدد
        </button>
      )}
    </div>
  );
}
