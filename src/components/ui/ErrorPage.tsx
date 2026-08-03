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
      <div className="rounded-full bg-primary/10 p-6">
        <span className="text-4xl text-primary">⚠</span>
      </div>
      {statusCode && <span className="text-6xl font-bold text-dark-blue">{statusCode}</span>}
      <h1 className="text-2xl font-bold text-dark-blue">{title}</h1>
      <p className="text-gray-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-secondary"
        >
          تلاش مجدد
        </button>
      )}
    </div>
  );
}
