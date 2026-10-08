import { AppDataProvider } from "@/components/app-data";
import { AssistantProvider } from "@/components/assistant/AssistantProvider";
import { RequireWallet } from "@/components/RequireWallet";
import { LiveUpdatesProvider } from "@/components/realtime/LiveUpdates";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/NavbarCl";
import { AppSidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  // expanded unless the person collapsed it (the choice is kept in a cookie)
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  return (
    <div suppressHydrationWarning className="min-h-screen flex flex-row">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AppDataProvider>
          <LiveUpdatesProvider>
          <AssistantProvider>
          {/* bottom, so a toast never covers the bell or the scope toggle */}
          <Toaster position="bottom-right" />
          <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar />
            <div className="w-full min-w-0">
              <Navbar className="sticky top-0 z-40" />
              <main className="overflow-y-auto px-3 py-3 sm:px-4 md:py-4 lg:px-4 lg:py-4">
                <RequireWallet>{children}</RequireWallet>
              </main>
            </div>
          </SidebarProvider>
          </AssistantProvider>
          </LiveUpdatesProvider>
        </AppDataProvider>
      </ThemeProvider>
    </div>
  );
}
