import Link from "next/link";
import { LuArrowLeft } from "react-icons/lu";

interface PageHeaderProps {
  backHref: string;
  backLabel: string;
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ backHref, backLabel, title, children }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3"
      >
        <LuArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}
