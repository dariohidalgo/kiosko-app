import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import "./globals.css";
import { SidebarProvider, Sidebar, SidebarInset, } from "@/components/ui/sidebar";
export const metadata = {
    title: "Admin Kiosko",
    description: "Gestión de ventas, usuarios e inventario",
};
export default function RootLayout({ children, }) {
    return (_jsx("html", { lang: "es", className: "h-full w-full", children: _jsx("body", { className: "h-full w-full", children: _jsx(SidebarProvider, { children: _jsxs("div", { className: "flex h-screen w-full", children: [_jsx(Sidebar, {}), _jsx(SidebarInset, { className: "flex-1 overflow-auto", children: children })] }) }) }) }));
}
