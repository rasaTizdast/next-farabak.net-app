import Breadcrumb from "@/app/_components/ui/Breadcrumb";

interface BreadcrumbWrapperProps {
  breadcrumbs: string[];
  renderStructuredData?: boolean;
}

export default function BreadcrumbWrapper({
  breadcrumbs,
  renderStructuredData = false,
}: BreadcrumbWrapperProps) {
  return <Breadcrumb breadcrumbs={breadcrumbs} renderStructuredData={renderStructuredData} />;
}
