import { AuthShell } from "@/components/auth/AuthShell";
import { AppDataProvider } from "@/components/app-data";
import { CreateFirstWallet } from "./CreateFirstWallet";

// Right after sign-up: the customer creates their first wallet before the
// dashboard opens (components/RequireWallet sends them here until they do).
export default function OnboardingPage() {
  return (
    <AuthShell>
      <AppDataProvider>
        <CreateFirstWallet />
      </AppDataProvider>
    </AuthShell>
  );
}
