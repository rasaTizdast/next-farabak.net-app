export default function SignupLoading() {
  return (
    <div className="flex min-h-[500px] items-center justify-center p-4">
      <div className="w-full max-w-md animate-pulse space-y-6 rounded-xl bg-gray-100 p-8">
        <div className="mx-auto h-20 w-20 rounded-full bg-gray-200" />
        <div className="mx-auto h-6 w-32 rounded bg-gray-200" />
        <div className="space-y-3">
          <div className="h-12 w-full rounded-lg bg-gray-200" />
          <div className="h-12 w-full rounded-lg bg-gray-200" />
          <div className="h-12 w-full rounded-lg bg-gray-200" />
          <div className="h-12 w-full rounded-lg bg-gray-200" />
        </div>
        <div className="h-12 w-full rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
