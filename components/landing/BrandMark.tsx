import Image from "next/image";
import { cn } from "@/lib/utils";

const LOGO = "/final_vergepay_logo.svg";

/**
 * The VergePay logo file at the same size as on the sign-in and sign-up
 * pages (components/auth/AuthShell.tsx): 144×40. The file has ~22px of empty
 * space on its left; -ml lines the wordmark up with the content edge.
 *
 * `onDark` is for the dark landing page: the mark keeps its brand green and
 * only the dark-green wordmark turns white, since it can't be read on black.
 * The file is one image, so it's drawn twice and each copy is clipped to its
 * part (the mark ends about 24.75% across the file, the wordmark starts after).
 */
export function BrandMark({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  if (!onDark) {
    return (
      <span className={cn("-ml-[22px] flex h-10 w-36 items-center overflow-hidden", className)}>
        <Image src={LOGO} alt="VergePay" width={144} height={40} className="object-contain" priority />
      </span>
    );
  }
  return (
    <span className={cn("relative -ml-[22px] flex h-10 w-36 items-center overflow-hidden", className)}>
      <Image src={LOGO} alt="VergePay" width={144} height={40} className="object-contain [clip-path:inset(0_75.25%_0_0)]" priority />
      <Image src={LOGO} alt="" aria-hidden width={144} height={40} className="absolute top-1/2 left-0 -translate-y-1/2 object-contain brightness-0 invert [clip-path:inset(0_0_0_24.75%)]" priority />
    </span>
  );
}
