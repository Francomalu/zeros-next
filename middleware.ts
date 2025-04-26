import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Definí qué rutas requieren ciertos roles
const protectedRoutes = [
  { path: "/dashboard/usuarios", roles: ["admin"] },
  { path: "/dashboard/precios", roles: ["admin", "vendedor"] },
  { path: "/dashboard/clientes", roles: ["admin", "vendedor"] },
  // ...
];

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  // Simulación de obtener el rol (deberías traerlo de cookies o headers)
//   const userRole = request.cookies.get("userRole")?.value || "guest";

//   // Buscar si la ruta está protegida
//   const matched = protectedRoutes.find((route) =>
//     pathname.startsWith(route.path)
//   );

//   // Si requiere roles y el usuario no tiene uno válido
//   if (matched && !matched.roles.includes(userRole)) {
//     return NextResponse.redirect(new URL("/unauthorized", request.url));
//   }

  return NextResponse.next();
}

export const config = {
    matcher: [
      "/customers/:path*",
      "/drivers/:path*",
    ],
};