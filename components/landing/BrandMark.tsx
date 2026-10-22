import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The VergePay logo file at the same size as on the sign-in and sign-up
 * pages (components/auth/AuthShell.tsx): 144×40. The file has ~22px of empty
 * space on its left; -ml lines the wordmark up with the content edge.
 * `onDark` turns the (dark green) logo white for the dark landing page.
 */
export function BrandMark({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <span className={cn("-ml-[22px] flex h-10 w-36 items-center overflow-hidden", className)}>
      <Image src="/final_vergepay_logo.svg" alt="VergePay" width={144} height={40} className={cn("object-contain", onDark && "brightness-0 invert")} priority />
    </span>
  );
}
