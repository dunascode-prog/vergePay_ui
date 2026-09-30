import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  return (
    <AuthShell>
      <SignupForm />
    </AuthShell>
  );
}
