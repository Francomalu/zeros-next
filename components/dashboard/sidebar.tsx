"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Bus,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LogOut,
  MapPin,
  Menu,
  Settings,
  User,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    clientes: false,
    direcciones: false,
    vehiculos: false,
  });

  const userRole = "admin";

  const toggleMenu = (menu: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setExpandedMenus((prev) => ({
        ...prev,
        [menu]: true,
      }));
    } else {
      setExpandedMenus((prev) => ({
        ...prev,
        [menu]: !prev[menu],
      }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    router.push("/");
  };

  const menuItems = [
    {
      name: "Reservas",
      icon: Calendar,
      path: "/reservas",
      roles: ["admin", "cliente"],
    },
    {
      name: "Clientes",
      icon: Users,
      submenu: [
        { name: "Lista", path: "/clientes/lista", roles: ["admin"] },
        { name: "Deudas", path: "/clientes/deudas", roles: ["admin"] },
      ],
    },
    {
      name: "Servicios",
      icon: Wrench,
      path: "/servicios",
      roles: ["admin"],
    },
    {
      name: "Choferes",
      icon: User,
      path: "/choferes",
      roles: ["admin"],
    },
    {
      name: "Usuarios",
      icon: Settings,
      path: "/usuarios",
      roles: ["admin"],
    },
    {
      name: "Direcciones",
      icon: MapPin,
      submenu: [
        {
          name: "Subidas y bajadas",
          path: "/direcciones/subidas-bajadas",
          roles: ["admin"],
        },
        { name: "Ciudades", path: "/direcciones/ciudades", roles: ["admin"] },
      ],
    },
    {
      name: "Vehículos",
      icon: Bus,
      submenu: [
        { name: "Coches", path: "/vehiculos/coches", roles: ["admin"] },
        {
          name: "Tipos de vehículo",
          path: "/vehiculos/tipos",
          roles: ["admin"],
        },
      ],
    },
    {
      name: "Precios",
      icon: CreditCard,
      path: "/precios",
      roles: ["admin"],
    },
    {
      name: "Mis Datos",
      icon: UserCheck,
      path: "/mis-datos",
      roles: ["cliente"],
    },
  ];

  const filteredMenu = menuItems
    .filter((item) => !item.roles || item.roles.includes(userRole))
    .map((item) => {
      if (item.submenu) {
        const filteredSubmenu = item.submenu.filter(
          (sub) => !sub.roles || sub.roles.includes(userRole)
        );
        return { ...item, submenu: filteredSubmenu };
      }
      return item;
    })
    .filter((item) => !item.submenu || item.submenu.length > 0);

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white border-r shadow-sm transition-all duration-300 ease-in-out md:translate-x-0",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className={cn(
              "flex items-center p-4 border-b",
              isCollapsed ? "justify-center" : "gap-2"
            )}
          >
            <Bus className="h-6 w-6 text-blue-600 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-xl font-bold text-blue-800 font-display">
                Zeros Tour
              </span>
            )}
          </div>

          {/* Toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute right-0 top-4 transform translate-x-1/2 bg-white border rounded-full shadow-sm hidden md:flex"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-1">
              {filteredMenu.map((item) => (
                <li key={item.name}>
                  {item.submenu ? (
                    <div>
                      <button
                        onClick={() => toggleMenu(item.name.toLowerCase())}
                        className={cn(
                          "flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-700",
                          expandedMenus[item.name.toLowerCase()]
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700",
                          isCollapsed ? "justify-center" : "justify-between"
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-center",
                            isCollapsed ? "justify-center" : "gap-3"
                          )}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {!isCollapsed && <span>{item.name}</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expandedMenus[item.name.toLowerCase()]
                                ? "rotate-180"
                                : ""
                            )}
                          />
                        )}
                      </button>
                      {expandedMenus[item.name.toLowerCase()] &&
                        !isCollapsed && (
                          <ul className="mt-1 ml-6 space-y-1">
                            {item.submenu.map((subitem) => (
                              <li key={subitem.name}>
                                <Link
                                  href={subitem.path}
                                  className={cn(
                                    "flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-700",
                                    pathname === subitem.path
                                      ? "bg-blue-100 text-blue-700 font-medium"
                                      : "text-gray-700"
                                  )}
                                >
                                  {subitem.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                  ) : (
                    <Link
                      href={item.path}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md hover:bg-blue-50 hover:text-blue-700",
                        pathname === item.path
                          ? "bg-blue-100 text-blue-700 font-medium"
                          : "text-gray-700",
                        isCollapsed ? "justify-center" : "gap-3"
                      )}
                      title={isCollapsed ? item.name : ""}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div
            className={cn(
              "p-4 border-t",
              isCollapsed ? "flex justify-center" : ""
            )}
          >
            <Button
              variant="outline"
              className={cn(
                "text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700",
                isCollapsed ? "w-10 h-10 p-0" : "w-full justify-start"
              )}
              onClick={handleLogout}
              title={isCollapsed ? "Cerrar Sesión" : ""}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Cerrar Sesión</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
