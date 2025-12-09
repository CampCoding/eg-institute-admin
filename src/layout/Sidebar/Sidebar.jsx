"use client";

import {
  Users2,
  PlusIcon,
  Home,
  X,
  ChevronDown,
  ShieldUser,
  CirclePlus,
  BookCopy,
  Store,
  CalendarClock,
  Group,
  CircleDollarSign,
  CalendarRange,
  HandCoins,
  FileStack,
  BookOpen,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const links = [
  { id: 1, label: "Home", icon: Home, href: "/" },

  {
    id: 293,
    label: "Blogs",
    icon: BookCopy,
    href: "/blogs",
    children: [
      { id: 1, name: "Blogs", icon: BookCopy, href: "/blogs" },
      { id: 2, name: "Add  Blog", icon: PlusIcon, href: "/blogs/add" },
    ],
  },

  {
    id: 2,
    label: "Users",
    icon: Users2,
    href: "/students",
    children: [
      { id: 1, name: "All Students", icon: Users2, href: "/students" },
      { id: 2, name: "Add Student", icon: CirclePlus, href: "/students/add" },
    ],
  },

  {
    id: 3,
    label: "Teachers",
    href: "/teachers",
    icon: ShieldUser,
    children: [
      { id: 1, name: "All Teachers", icon: ShieldUser, href: "/teachers" },
      { id: 2, name: "Add Teacher", icon: CirclePlus, href: "/teachers/add" },
    ],
  },

  {
    id: 4,
    label: "Courses",
    icon: BookCopy,
    href: "/courses",
    children: [
      { id: 1, name: "All Courses", icon: BookCopy, href: "/courses" },
      { id: 2, name: "Add Courses", icon: CirclePlus, href: "/courses/add" },
    ],
  },

  // {
  //   id: 5,
  //   label: "Store",
  //   icon: Store,
  //   href: "/store",
  //   children: [
  //     { id: 1, name: "Store", icon: Store, href: "/store" },
  //     { id: 2, name: "Add Store", icon: CirclePlus, href: "/store/add-store" },
  //   ],
  // },

  { id: 6, label: "Reservations", icon: CalendarClock, href: "/reservations" },

  {
    id: 7,
    label: "Groups",
    icon: Group,
    href: "/groups",
    children: [
      { id: 1, name: "Group List", icon: Group, href: "/groups" },
      { id: 2, name: "Add Group", icon: CirclePlus, href: "/groups/add-group" },
    ],
  },

  { id: 8, label: "Scheduling", icon: CalendarRange, href: "/scheduling" },

  {
    id: 9,
    label: "Finance Transactions",
    icon: CircleDollarSign,
    href: "/finance-transactions",
    children: [
      {
        id: 1,
        name: "Finance Transactions",
        icon: CircleDollarSign,
        href: "/finance-transactions",
      },
      {
        id: 2,
        name: "Add Finance",
        icon: CirclePlus,
        href: "/finance-transactions/add-finance",
      },
    ],
  },

  {
    id: 10,
    label: "Colloection Of Dues",
    icon: HandCoins,
    href: "/collection-of-dues",
    children: [
      {
        id: 1,
        name: "Colloection Of Dues",
        href: "/collection-of-dues",
        icon: HandCoins,
      },
      { id: 2, name: "Add", href: "/collection-of-dues/add", icon: CirclePlus },
    ],
  },

  { id: 11, label: "Reports", icon: FileStack, href: "/reports" },

  {
    id: 12,
    label: "Live Courses",
    icon: BookOpen,
    href: "/live-courses",
    children: [
      {
        id: 1,
        name: "All Live Courses",
        icon: BookOpen,
        href: "/live-courses",
      },
      {
        id: 2,
        name: "Add Live Courses",
        icon: CirclePlus,
        href: "/live-courses/add",
      },
    ],
  },
];

const Sidebar = ({ colors, sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();

  // which menus are expanded
  const [openMenus, setOpenMenus] = useState({});

  // Derived: which parent should be considered active (when any child is active)
  const activeParentIds = useMemo(() => {
    const ids = new Set();
    links.forEach((item) => {
      if (!item.children) return;
      if (
        item.children.some(
          (c) => pathname === c.href || pathname.startsWith(c.href + "/")
        )
      ) {
        ids.add(item.id);
      }
    });
    return ids;
  }, [pathname]);

  // Ensure the active parent's menu is open when route changes
  useEffect(() => {
    if (!activeParentIds.size) return;
    setOpenMenus((prev) => {
      const next = { ...prev };
      activeParentIds.forEach((id) => (next[id] = true));
      return next;
    });
  }, [activeParentIds]);

  const toggleMenu = (id) =>
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

  const isMenuOpen = (item) =>
    openMenus[item.id] ?? activeParentIds.has(item.id) ?? false;

  const closeOnMobile = () => {
    // auto-close the sidebar when navigating on small screens
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen?.(false);
    }
  };

  const parentActive = (item) =>
    pathname === item.href ||
    pathname.startsWith(item.href + "/") ||
    item.children?.some((c) => pathname.startsWith(c.href)) ||
    false;

  const activeStyles = {
    backgroundColor: colors?.primary,
    color: "#fff",
  };

  return (
    <div
      className={`fixed max-h-[100vh] inset-y-0 left-0 z-50 !w-80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col w-full h-full bg-white border-r border-dashed border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-dashed border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <img
                src="/logo.png"
                alt="logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg font-bold" style={{ color: colors?.text }}>
              Egyptian Institute
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 side-list px-4 py-6 space-y-2 overflow-y-auto max-h-[calc(100vh-145px)]">
          {links.map((item) => {
            const hasChildren = !!item.children?.length;
            const open = hasChildren && isMenuOpen(item);
            const isParentActive = parentActive(item);

            return (
              <div key={item.id}>
                {/* Parent row: text navigates, chevron toggles */}
                <div
                  className={`flex items-stretch justify-between rounded-lg transition-colors duration-200 ${
                    isParentActive ? "shadow-sm" : ""
                  }`}
                  style={isParentActive ? activeStyles : {}}
                >
                  {/* Parent label (Link) */}
                  <Link
                    href={item.href}
                    className={`flex items-center flex-1 px-4 py-3 text-sm font-medium rounded-l-lg ${
                      isParentActive
                        ? "text-white"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={closeOnMobile}
                  >
                    {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                    {item.label}
                  </Link>

                  {/* Toggle chevron (only for parents with children) */}
                  {hasChildren && (
                    <button
                      type="button"
                      aria-label={open ? "Collapse" : "Expand"}
                      aria-expanded={open}
                      aria-controls={`submenu-${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleMenu(item.id);
                      }}
                      className={`px-3 rounded-r-lg transition ${
                        isParentActive
                          ? "text-white/90 hover:text-white"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                          open ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Submenu */}
                {hasChildren && open && (
                  <div
                    id={`submenu-${item.id}`}
                    className="ml-6 mt-1 space-y-1"
                  >
                    {item.children.map(
                      (child) =>
                        !child.hidden && (
                          <Link
                            key={child.id}
                            href={child.href}
                            onClick={closeOnMobile}
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                              pathname === child.href
                                ? "text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                            style={pathname === child.href ? activeStyles : {}}
                          >
                            <child.icon className="w-4 h-4 mr-2" />
                            {child.name}
                          </Link>
                        )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer/Profile */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: colors?.secondary }}
            >
              JD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <div>
            <LogOut
              colors="red"
              className=" cursor-pointer text-red-600"
              onClick={() => {
                localStorage.removeItem("AccessToken");
                window.location.href = "/login";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
