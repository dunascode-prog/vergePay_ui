import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LuSearchX, LuArrowLeft } from "react-icons/lu";

export default function RecurringPlanNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <LuSearchX className="h-6 w-6 text-gray-400" />
      </div>
      <h1 className="text-lg font-semibold text-gray-900 mb-1">Recurring plan not found</h1>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        This plan may have been deleted, or the link you followed might be out of date.
      </p>
      <Link href="/dashboard/recurring">
        <Button variant="outline">
          <LuArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to recurring billing
        </Button>
      </Link>
    </div>
  );
}
