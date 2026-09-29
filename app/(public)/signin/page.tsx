import { LoginForm } from "@/components/signin-form";
import Image from "next/image";

function safeNext(value: string | string[] | undefined): string {
  // Only same-site paths, so ?next= can't send someone to another site.
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export default async function LoginPage({ searchParams }: PageProps<"/signin">) {
  const params = await searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex h-10 w-40 items-center justify-start rounded-md overflow-hidden">
          <Image
            src="/final_vergepay_logo.svg"
            alt="VergePay Logo"
            width={160}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        <LoginForm
          next={safeNext(params.next)}
          initialStep={params.step === "2fa" ? "code" : "credentials"}
          justRegistered={params.registered === "1"}
        />
      </div>
    </div>
  );
}
