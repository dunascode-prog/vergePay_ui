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
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <div suppressHydrationWarning className="min-h-screen flex flex-row">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <div className="w-full">
            <Navbar className="sticky top-0 z-40 border-b bg-background" />
            <main className="overflow-y-auto px-1 py-2 d:px-2 md:py-4 lg:px-4 lg:py-4">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </div>
  );
}
