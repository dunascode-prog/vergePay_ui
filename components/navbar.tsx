"use client";
import {
  Bell,
  BellRing,
  Headphones,
  LogOut,
  Moon,
  Plus,
  ReceiptText,
  Repeat,
  Search,
  SearchCode,
  Sun,
  User2,
  Users,
} from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Button } from "./ui/button";
import {
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "./ui/sidebar";

const items = [
  { label: "Personal", value: null },
  { label: "Business", value: "apple" },
  { label: "Combined", value: "banana" },
];

const Navbar = () => {
  const { setTheme } = useTheme();
  return (
    //   <div className="flex flex-row justify-between items-center p-2">
    //     <SidebarTrigger />
    //     <div className="flex flex-row gap-2.5 items-center">
    //       <Select items={items}>
    //         <SelectTrigger className="w-full max-w-48">
    //           <SelectValue />
    //         </SelectTrigger>
    //         <SelectContent sideOffset={10}>
    //           <SelectGroup>
    //             <SelectLabel>Spaces</SelectLabel>
    //             {items.map((item) => (
    //               <SelectItem key={item.value} value={item.value}>
    //                 {item.label}
    //               </SelectItem>
    //             ))}
    //           </SelectGroup>
    //         </SelectContent>
    //       </Select>
    //       <DropdownMenu>
    //         <DropdownMenuTrigger
    //           render={
    //             <Button variant="outline" size="icon">
    //               <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
    //               <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    //               <span className="sr-only">Toggle theme</span>
    //             </Button>
    //           }
    //         />

    //         <DropdownMenuContent align="end" sideOffset={10}>
    //           <DropdownMenuItem onClick={() => setTheme("light")}>
    //             Light
    //           </DropdownMenuItem>
    //           <DropdownMenuItem onClick={() => setTheme("dark")}>
    //             Dark
    //           </DropdownMenuItem>
    //           <DropdownMenuItem onClick={() => setTheme("system")}>
    //             System
    //           </DropdownMenuItem>
    //         </DropdownMenuContent>
    //       </DropdownMenu>

    //       <DropdownMenu>
    //         <DropdownMenuTrigger>
    //           <Avatar>
    //             <AvatarImage src="https://i.pravatar.cc/300" alt="@shadcn" />
    //             <AvatarFallback>CN</AvatarFallback>
    //             <AvatarBadge className="bg-green-600 dark:bg-green-800" />
    //           </Avatar>
    //         </DropdownMenuTrigger>
    //         <DropdownMenuContent sideOffset={10}>
    //           <DropdownMenuGroup>
    //             <DropdownMenuLabel> My Account</DropdownMenuLabel>
    //             <DropdownMenuItem>
    //               <User2 className="h-[1.2rem] w-[1.2rem] mr-2" /> Profile
    //             </DropdownMenuItem>
    //             <DropdownMenuItem>
    //               <ReceiptText className="h-[1.2rem] w-[1.2rem] mr-2" /> Billing
    //             </DropdownMenuItem>
    //           </DropdownMenuGroup>
    //           <DropdownMenuSeparator />
    //           <DropdownMenuGroup>
    //             <DropdownMenuItem>
    //               <Users className="h-[1.2rem] w-[1.2rem] mr-2" /> Team
    //             </DropdownMenuItem>
    //             <DropdownMenuItem>
    //               <Repeat className="h-[1.2rem] w-[1.2rem] mr-2" /> Subscription
    //             </DropdownMenuItem>
    //           </DropdownMenuGroup>
    //           <DropdownMenuSeparator />
    //           <DropdownMenuGroup>
    //             <DropdownMenuItem>
    //               <Headphones className="h-[1.2rem] w-[1.2rem] mr-2" /> Support
    //             </DropdownMenuItem>
    //             <DropdownMenuItem variant={"destructive"}>
    //               <LogOut className="h-[1.2rem] w-[1.2rem] mr-2" /> Log out
    //             </DropdownMenuItem>
    //           </DropdownMenuGroup>
    //         </DropdownMenuContent>
    //       </DropdownMenu>
    //     </div>
    //   </div>

    <div className="px-3 py-3 flex flex-row justify-between items-center">
      <div className="flex flex-row items-center gap-1">
        <SidebarTrigger />
        <div>
          <p className="-mb-1">Good Morning, Seun</p>
          <h6>Dashboard</h6>
        </div>
      </div>
      <div className="flex flex-row justify-between gap-3 items-center">
        <div className="flex items-center gap-1 rounded-lg bg-sidebar-border p-1">
          <SidebarMenuButton
            isActive
            className="rounded-md px-3 py-1.5 text-sm font-medium"
          >
            Personal
          </SidebarMenuButton>

          <SidebarMenuButton className="rounded-md px-3 py-1.5 text-sm font-medium">
            Business
          </SidebarMenuButton>

          <SidebarMenuButton className="rounded-md px-3 py-1.5 text-sm font-medium">
            Combined
          </SidebarMenuButton>
        </div>
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
              <Button variant="outline" size="icon">
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

        <div>
          {" "}
          <Button>
            <Plus />
            Add Money
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
