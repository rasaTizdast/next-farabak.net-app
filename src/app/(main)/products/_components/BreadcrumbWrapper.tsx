import Breadcrumb from "@/app/_components/ui/Breadcrumb";

interface BreadcrumbWrapperProps {
  breadcrumbs: string[];
}

export default function BreadcrumbWrapper({ breadcrumbs }: BreadcrumbWrapperProps) {
  return <Breadcrumb breadcrumbs={breadcrumbs} />;
}
