import Image from "next/image";

interface ErrorPageProps {
  title?: string;
  message?: string;
  statusCode?: number;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export function ErrorPage({
  title = "خطا",
  message = "خطایی رخ داده است",
  statusCode,
  onRetry,
  children,
}: ErrorPageProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-5 py-12 text-center">
      {statusCode === 404 ? (
        <Image
          src="/404.png"
          alt=""
          width={1366}
          height={666}
          sizes="(max-width: 768px) 100vw, 700px"
          className="h-auto w-full max-w-[700px]"
        />
      ) : (
        <div className="bg-primary/10 rounded-full p-6">
          <span className="text-primary text-4xl">⚠</span>
        </div>
      )}
      {statusCode && statusCode !== 404 && (
        <span className="text-dark-blue text-6xl font-bold">{statusCode}</span>
      )}
      <h1 className="text-dark-blue text-2xl font-bold">{title}</h1>
      <p className="text-gray-600">{message}</p>
      {children}
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
