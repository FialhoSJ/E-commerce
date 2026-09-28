import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import "./globals.css";
import { Toaster } from "sonner";
import { StoreProvider } from "./components/StoreProvider";
import { Bebas_Neue, Inter } from "next/font/google";

const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-bebas-neue' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

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
    <html lang="pt-BR" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body className="bg-[#f3f0e8]">
        <StoreProvider><Navbar /><main className="min-h-screen">{children}</main></StoreProvider>
        <Toaster richColors position="bottom-right" toastOptions={{ style: { borderRadius: '12px' } }} />
      </body>
    </html>
  );
}
