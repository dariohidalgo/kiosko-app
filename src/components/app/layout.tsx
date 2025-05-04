import type { Metadata } from "next";
import "./globals.css";
import * as React from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Admin Kiosko",
  description: "Gestión de ventas, usuarios e inventario",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full w-full">
      <body className="h-full w-full">
        <SidebarProvider>
          <div className="flex h-screen w-full">
            <Sidebar>{/* Aquí va tu navegación lateral */}</Sidebar>
            <SidebarInset className="flex-1 overflow-auto">
              {children}
            </SidebarInset>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
