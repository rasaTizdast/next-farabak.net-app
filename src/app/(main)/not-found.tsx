import { ErrorPage } from "@/components/ui/ErrorPage";

const NotFound = () => {
  return (
    <ErrorPage
      statusCode={404}
      title="صفحه مورد نظر یافت نشد"
      message="صفحه‌ای که به دنبال آن هستید وجود ندارد."
    />
  );
};

export default NotFound;
