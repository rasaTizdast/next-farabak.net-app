import { ErrorPage } from "@/components/ui/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage statusCode={404} title="صفحه یافت نشد" message="صفحه مورد نظر شما وجود ندارد" />
  );
}
