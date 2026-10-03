import Image from "next/image";
import { cn } from "@/lib/utils";

// The VergePay logo file itself (public/final_vergepay_logo.svg). The file is
// an 800×800 square with the logo across its middle (about x 125–675,
// y 355–440), so it's shown in a frame cropped to the logo.
const FILE_SIZE = 233; // rendered size of the whole square
const CROP = { width: 162, height: 27, left: -36, top: -102 };

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative block overflow-hidden", className)} style={{ width: CROP.width, height: CROP.height }}>
      <Image
        src="/final_vergepay_logo.svg"
        alt="VergePay"
        width={FILE_SIZE}
        height={FILE_SIZE}
        priority
        className="absolute max-w-none"
        style={{ left: CROP.left, top: CROP.top, width: FILE_SIZE, height: FILE_SIZE }}
      />
    </span>
  );
}
