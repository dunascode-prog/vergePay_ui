"use client";

import Image from "next/image";

export default function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="animate-pulse">
          <Image
            src="/final_vergepay_logoc.svg"
            alt="VergePay"
            width={120}
            height={120}
            priority
          />
        </div>

        <div className="flex gap-2">
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-primary"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
