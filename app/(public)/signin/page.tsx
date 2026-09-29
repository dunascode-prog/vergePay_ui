import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/signin-form";

function safeNext(value: string | string[] | undefined): string {
  // Only same-site paths, so ?next= can't send someone to another site.
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export default async function LoginPage({ searchParams }: PageProps<"/signin">) {
  const params = await searchParams;

  return (
    <AuthShell>
      <LoginForm
        next={safeNext(params.next)}
        initialStep={params.step === "2fa" ? "code" : "credentials"}
        justRegistered={params.registered === "1"}
      />
    </AuthShell>
  );
}
