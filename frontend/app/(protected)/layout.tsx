"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";
import AuthInitializer from "@/app/components/auth/AuthInitializer";
import Sidebar from "@/app/components/navigation/Sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthInitializer>
      <ProtectedRoute>
        <div className="flex min-h-screen bg-[#fffdfb]">
          <Sidebar />

          <main className="min-w-0 flex-1 pb-[72px] lg:pb-0">
            {children}
          </main>
        </div>
      </ProtectedRoute>
    </AuthInitializer>
  );
}