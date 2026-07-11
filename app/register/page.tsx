import { GalleryVerticalEnd } from "lucide-react";

import { SignupForm } from "@/components/signup-form";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full items-center max-w-sm flex-col gap-6">
        <Link href="/">
          <div className="flex h-10 w-40 items-center justify-start rounded-md overflow-hidden">
            <Image
              src="/vergepay_logo.svg"
              alt="VergePay Logo"
              width={160}
              height={40}
              className="object-contain"
              priority
            />
          </div>
        </Link>
        <SignupForm />
      </div>
    </div>
  );
}
