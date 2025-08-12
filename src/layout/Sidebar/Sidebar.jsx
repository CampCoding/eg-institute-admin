"use client";

import { 
  Users2, 
  PlusIcon, 
  Home, 
  X, 
  CircleChevronDown,
  ChevronDown,
  ShieldUser,
  CirclePlus,
  BookCopy,
  Video,
  Files,
  Store,
  CalendarClock,
  Group,
  CircleDollarSign,
  CalendarRange,
  HandCoins,
  FileStack
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  {
    id: 1,
    label: "Home",
    icon: Home,
    href: "/"
  },
  {
    id: 2,
    label: "Users",
    icon: Users2,
    href: "/students",
    children: [
      {
        id: 1,
        name: "All Students",
        icon: Users2,
        href: "/students",
        hidden: false,
      },
      {
        id: 2,
        name: "Add Student",
        icon: CirclePlus,
        href: "/students/add",
        hidden: false,
      }
    ]
  },
  {
    id:3,
    label:"Instructors",
    href:"/teachers",
    icon: ShieldUser,
    hidden:false,
    children : [
      {
        id: 1,
        name: "All Teachers",
        icon: ShieldUser,
        href: "/teachers",
        hidden: false,
      },
      {
        id: 2,
        name: "Add Teacher",
        icon: CirclePlus,
        href: "/teachers/add",
        hidden: false,
      },
    ]
  },
  {
    id:4,
    label: "Courses",
    icon: BookCopy,
    href: "/courses",
    children : [
      {
        id:1,
        name:"All Courses",
        icon: BookCopy,
        href: "/courses"
      },
      {
        id:2,
        name:"Add Courses",
        icon: CirclePlus,
        href: "/courses/add"
      }
    ]
  },
  {
    id:5,
    label: "Store",
    icon: Store,
    href: "/store",
    children : [
      {
        id:1,
        name:"Store",
        icon: Store,
        href: "/store"
      },
      {
        id:2,
        name:"Add Store",
        icon: CirclePlus,
        href: "/store/add-store"
      }
    ]
  },
  {
    id:6,
    label:"Reservations",
    icon: CalendarClock,
    href:"/reservations",
  },
  {
    id:7,
    label:"Groups",
    icon: Group ,
    href:"/groups",
    children : [
      {
        id:1,
        name:"Group List",
        icon: Group,
        href:"/groups"
      },
      {
        id:2,
        name:"Add Group",
        icon: CirclePlus,
        href:"/groups/add-group"
      }
    ]
  },
  {
    id:8,
    label:"Scheduling",
    icon: CalendarRange,
    href:"/scheduling"
  },
  {
    id:9,
    label:"Finance Transactions",
    icon : CircleDollarSign,
    href:"/finance-transactions",
    children : [
      {
        id:1,
        name:"Finance Transactions",
        icon : CircleDollarSign ,
        href:"/finance-transactions"
      },
      {
        id:2,
        name:"Add Finance",
        icon : CirclePlus ,
        href:"/finance-transactions/add-finance"
      }
    ]
  },
  {
    id:10,
    label:"Colloection Of Dues",
    icon:HandCoins,
    href:"/collection-of-dues",
    children : [
      {
        id:1,
        name:"Colloection Of Dues",
        href:"/collection-of-dues",
        icon :HandCoins
      },
      {
        id:2,
        name:"Add",
        href:"",
        icon :CirclePlus
      }
    ]
  },
  {
    id:11,
    label:"Reports",
    icon : FileStack,
    href:"/reports",
  }
];

const Sidebar = ({ colors, sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isMenuOpen = (item) => {
    if (openMenus[item.id] !== undefined) return openMenus[item.id];
    return item.children?.some((child) => pathname.startsWith(child.href));
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 !w-80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col w-full h-full bg-white border-r border-dashed border-gray-200">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-dashed border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <img src="/logo.png" alt="logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-bold" style={{ color: colors.text }}>
              Egyptian Institute
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {links.map((item) => {
            const isActiveParent = pathname === item.href || pathname.startsWith(item.href + "/");
            const hasChildren = !!item.children?.length;
            const showChildren = hasChildren && isMenuOpen(item);

            return (
              <div key={item.id}>
                {/* Parent Link or Toggle */}
                <Link 
                  href={item?.href}
                  onClick={() => (hasChildren ? toggleMenu(item.id) : null)}
                  className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg cursor-pointer transition-colors duration-200 ${
                    isActiveParent
                      ? "text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  style={isActiveParent ? { backgroundColor: colors.primary } : {}}
                >
                  <div className="flex items-center">
                    {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                    {item.label}
                  </div>
                  {hasChildren && (
                    <ChevronDown className={showChildren ?  "rotate-180" : ""} />
                  )}
                </Link>

                {/* Submenu */}
                {showChildren && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map(
                      (child) =>
                        !child.hidden && (
                          <Link
                            key={child.id}
                            href={child.href}
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                              pathname === child.href
                                ? "text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                            style={
                              pathname === child.href ? { backgroundColor: colors.primary } : {}
                            }
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
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: colors.secondary }}
            >
              JD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
