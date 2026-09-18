import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import "./globals.css";
import clsx from "clsx";
import { StoreProvider } from "./components/StoreProvider";

export const metadata: Metadata = {
  title: "3D Store",
  description: "Sua loja online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={clsx('bg-[#f8faf9] font-sans')}>
        <StoreProvider><Navbar /><main className="min-h-screen">{children}</main></StoreProvider>
      </body>
    </html>
  );
}
