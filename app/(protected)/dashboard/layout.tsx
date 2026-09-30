import { AppDataProvider } from "@/components/app-data";
import { RequireWallet } from "@/components/RequireWallet";
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
  // Open on a first visit; after that, whatever the user last chose.
  const saved = cookieStore.get("sidebar_state")?.value;
  const defaultOpen = saved === undefined ? true : saved === "true";
  return (
    <div suppressHydrationWarning className="min-h-screen flex flex-row">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AppDataProvider>
          <SidebarProvider
            defaultOpen={defaultOpen}
            style={{ "--sidebar-width": "17rem", "--sidebar-width-icon": "3.5rem" } as React.CSSProperties}
          >
            <AppSidebar />
            <div className="w-full">
              <Navbar className="sticky top-0 z-40 border-b" />
              <main className="overflow-y-auto px-3 py-3 sm:px-4 md:py-4 lg:px-4 lg:py-4">
                <RequireWallet>{children}</RequireWallet>
              </main>
            </div>
          </SidebarProvider>
        </AppDataProvider>
      </ThemeProvider>
    </div>
  );
}
