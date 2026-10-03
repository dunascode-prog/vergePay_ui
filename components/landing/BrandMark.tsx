import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The VergePay logo: the green mark and the wordmark. The wordmark is set
 * in type (the logo file is a square with a lot of space around it), in the
 * logo's own dark green, or white on dark backgrounds.
 */
export function BrandMark({ inverted = false, className }: { inverted?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image src="/final_vergepay_logoc.svg" alt="" width={30} height={30} className="size-7.5 scale-[1.45]" priority />
      <span className={cn("text-[1.35rem] font-extrabold tracking-[-0.04em]", inverted ? "text-white" : "text-[#0F6452]")}>vergepay</span>
    </span>
  );
}
