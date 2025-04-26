'use client';

import type React from 'react';

import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Check if user is logged in
  //   useEffect(() => {
  //     const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  //     const userRole = localStorage.getItem("userRole");

  //     if (!isLoggedIn || userRole !== "admin") {
  //       router.push("/");
  //     }
  //   }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto ml-16 md:ml-16">{children}</main>
    </div>
  );
}
