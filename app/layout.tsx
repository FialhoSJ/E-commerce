import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import "./globals.css";
import clsx from "clsx";
import { Toaster } from "sonner";
import { StoreProvider } from "./components/StoreProvider";

export const metadata: Metadata = {
  title: "LACIS — Objetos feitos em camadas",
  description: "Design autoral, objetos funcionais e peças personalizadas produzidas em impressão 3D.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={clsx('bg-[#f3f0e8] font-sans')}>
        <StoreProvider><Navbar /><main className="min-h-screen">{children}</main></StoreProvider>
        <Toaster richColors position="bottom-right" toastOptions={{ style: { borderRadius: '12px' } }} />
      </body>
    </html>
  );
}
