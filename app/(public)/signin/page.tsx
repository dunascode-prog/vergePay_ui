"use client";
import Loader from "@/components/Loader";
import { LoginForm } from "@/components/signin-form";
import Image from "next/image";
import { useState } from "react";

export default function LoginPage() {
  const [loader, setLoader] = useState(false);

  return (
    <div className="relative">
      {loader && <Loader />}
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col items-center gap-6">
          <div className="flex h-10 w-40 items-center justify-start rounded-md overflow-hidden">
            <Image
              src="/vergePay_logo.svg"
              alt="VergePay Logo"
              width={160}
              height={40}
              className="object-contain"
              priority-dev="true"
            />
          </div>
          <LoginForm loading={loader} setLoader={setLoader} />
        </div>
      </div>
    </div>
  );
}
