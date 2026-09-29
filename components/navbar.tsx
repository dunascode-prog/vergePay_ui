"use client";
import {
  Bell,
  BellRing,
  CalendarSearch,
  Check,
  ChevronDown,
  Command,
  Download,
  Ellipsis,
  Filter,
  Headphones,
  LogOut,
  Monitor,
  Moon,
  MoreHorizontal,
  PanelLeft,
  Plus,
  ReceiptText,
  Repeat,
  Search,
  SearchCode,
  Sun,
  User2,
  Users,
  Wallet,
} from "lucide-react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "./ui/button";
import { LuDownload } from "react-icons/lu";
import { AccountScopeToggle } from "./AccountScopeToggle";
import { InvoiceFilters } from "./InvoiceFilters";
import Link from "next/link";

const items = [
  { label: "Personal", value: null },
  { label: "Business", value: "apple" },
  { label: "Combined", value: "banana" },
];
type PageTitle = {
  title: string;
  description: string;
};

const pageTitles: Record<string, PageTitle> = {
  "/dashboard": { title: "Dashboard", description: "Good Morning, Seun" },
  "/dashboard/analytics": {
    title: "Analytics",
    description: "Financial health & habits",
  },
  "/dashboard/invoices": {
    title: "Invoices",
    description: "Manage client invoices in one place.",
  },
  "/dashboard/recurring": {
    title: "Recurring Billing",
    description: "Manage Recurrent Billings Here",
  },
  "/dashboard/business": {
    title: "Business Overview",
    description: "Current Profit Status",
  },
};
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const accounts = ["Personal", "Business", "Combined"];

interface AccountSwitcherProps {
  accountType: string;
  setAccountType: (value: string) => void;
}
export function AccountSwitcher({
  accountType,
  setAccountType,
}: AccountSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="lg:hidden 2xl:hidden h-10 w-30 rounded-xl border-0 bg-muted px-4 shadow-sm hover:bg-muted/80 transition-colors"
          >
            <span className="flex items-center gap-2">
              <div className="flex flex-col items-start leading-none">
                <span className="text-sm font-medium">{accountType}</span>
              </div>
            </span>

            <ChevronDown className="h-4 w-4 opacity-60 transition-transform data-[state=open]:rotate-180" />
          </Button>
        }
      />

      <DropdownMenuContent align="start" className="w-56 rounded-xl">
        {accounts.map((account) => (
          <DropdownMenuItem
            key={account}
            onClick={() => setAccountType(account)}
            className="flex cursor-pointer items-center justify-between rounded-lg"
          >
            <span className="text-sm font-medium">{account}</span>

            {account === accountType && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface MonthSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedMonth: string;
  setSelectedMonth: Dispatch<SetStateAction<string>>;
}
export function DaySelector({
  className,
  selectedMonth,
  setSelectedMonth,
  ...props
}: MonthSelectorProps) {
  return (
    <Select value={selectedMonth} onValueChange={(v) => setSelectedMonth(v ?? "")}>
      <SelectTrigger
        className={cn(
          "h-10 w-30 rounded-xl border-0 bg-muted px-4 shadow-sm hover:bg-muted/80 transition-colors",
          className,
        )}
      >
        <SelectValue placeholder="Select Day" />
      </SelectTrigger>

      <SelectContent className="max-h-72">
        {months.map((month) => (
          <SelectItem key={month} value={month}>
            {month}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
const Navbar = ({ className, ...props }: React.ComponentProps<"div">) => {
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [accountType, setAccountType] = useState("Personal");
  const { title, description } = pageTitles[pathname] ?? {
    title: "Dashboard",
    description: "Good Morning, Seun",
  };
  const [selectedMonth, setSelectedMonth] = useState(
    months[new Date().getMonth()],
  );
  return (
    <div
      className={cn(
        "px-3 py-3 flex flex-row justify-between items-center",
        className,
      )}
    >
      <div className="flex flex-row items-center gap-1">
        <SidebarTrigger />
        <div>
          <p className="hidden lg:flex 2xl:flex -mb-1">{description}</p>
          <h6>{title}</h6>
        </div>
      </div>
      <div className="flex flex-row justify-between gap-2 items-center">
        {pathname === "/dashboard" ||
        pathname === "/dashboard/analytics/*" ||
        pathname === "/dashboard/invoices/*" ? (
          <AccountScopeToggle />
        ) : (
          <></>
        )}
        <div
          className={cn(
            !collapsed ? "hidden" : "hidden lg:flex lg:flex-row lg:gap-1",
          )}
        >
          <Button variant="secondary" size="icon" className="rounded-full">
            <Search className="size-3" />
          </Button>
          <div className="relative">
            <Button variant="secondary" size="icon" className="rounded-full">
              <Bell className="size-3" />
            </Button>
            <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon" className="rounded-full">
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              }
            />

            <DropdownMenuContent align="end" sideOffset={10}>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className={cn(!collapsed ? "" : "lg:hidden 2xl:hidden")}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon">
                  <Command className="h-5 w-5" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="mr-2 h-4 w-4" />
                  Appearance
                </DropdownMenuSubTrigger>

                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>{selectedMonth}</span>
                </DropdownMenuSubTrigger>

                <DropdownMenuSubContent>
                  {months.map((month) => (
                    <DropdownMenuItem
                      key={month}
                      onClick={() => setSelectedMonth(month)}
                    >
                      {month}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          {" "}
          {pathname == "/dashboard" ? (
            <Link href="">
              <Button className="bg-emerald-700 hover:bg-emerald-800">
                <Plus />
                Add Money
              </Button>
            </Link>
          ) : pathname == "/dashboard/analytics" ? (
            <Link href="">
              <Button className="bg-emerald-700 hover:bg-emerald-800">
                <LuDownload />
                Export Report
              </Button>
            </Link>
          ) : pathname == "/dashboard/invoices" ? (
            <Link href="/dashboard/invoices/new">
              <Button className="bg-emerald-700 hover:bg-emerald-800">
                <Plus />
                New Invoice
              </Button>
            </Link>
          ) : pathname == "/dashboard/recurring" ? (
            <Link href="/dashboard/recurring/new">
              <Button className="bg-emerald-700 hover:bg-emerald-800">
                <Plus />
                New Plan
              </Button>
            </Link>
          ) : (
            ""
          )}
        </div>

        {pathname == "/dashboard/invoices" ? (
          <div className="md:flex lg:hidden 2xl:hidden"></div>
        ) : (
          <AccountSwitcher
            accountType={accountType}
            setAccountType={setAccountType}
          />
        )}
      </div>
    </div>
  );
};

export default Navbar;
