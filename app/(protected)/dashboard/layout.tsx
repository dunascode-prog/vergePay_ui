import { AppDataProvider } from "@/components/app-data";
import { RequireWallet } from "@/components/RequireWallet";
import { LiveUpdatesProvider } from "@/components/realtime/LiveUpdates";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/NavbarCl";
import { AppSidebar } from "@/components/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  // expanded unless the customer collapsed it last time
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  return (
    <div suppressHydrationWarning className="flex min-h-screen flex-row">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AppDataProvider>
          <LiveUpdatesProvider>
            {/* bottom, so a toast never covers the bell or the scope toggle */}
            <Toaster position="bottom-right" />
            <TooltipProvider delay={300}>
              <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                  <Navbar className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70" />
                  <main className="flex-1 px-3 py-4 sm:px-4 lg:px-6">
                    <RequireWallet>{children}</RequireWallet>
                  </main>
                </div>
              </SidebarProvider>
            </TooltipProvider>
          </LiveUpdatesProvider>
        </AppDataProvider>
      </ThemeProvider>
    </div>
  );
}
