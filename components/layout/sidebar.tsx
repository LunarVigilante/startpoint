"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  Building2,
  UserMinus,
  FileText,
  Settings,
  Search,
  CheckSquare,
  AlertTriangle,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Assets",
    href: "/assets",
    icon: Package,
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    name: "Departments",
    href: "/departments",
    icon: Building2,
  },
  {
    name: "Anomalies",
    href: "/anomalies",
    icon: AlertTriangle,
  },
  {
    name: "Offboarding",
    href: "/offboarding",
    icon: UserMinus,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-700">
      <div className="flex h-16 items-center px-6 border-b dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SP</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">StartPoint</span>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-blue-500 dark:text-blue-400" : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t dark:border-gray-700 p-3">
        <Link
          href="/settings"
          className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
        >
          <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
          Settings
        </Link>
      </div>
    </div>
  );
} 