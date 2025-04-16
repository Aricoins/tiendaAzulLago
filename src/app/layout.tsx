import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/NavBar";
import { Suspense } from "react";
import { ClerkProvider, RedirectToSignIn, SignedOut } from "@clerk/nextjs";
import { StoreProvider } from "@/redux/storeProvider";
import CartSideBar from "@/components/CartSideBar";
import App from "@/components/App";
import { Analytics } from "@vercel/analytics/react";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Azul Lago Tienda",
  description: "Creado por ArielRogel.TECH",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
        <StoreProvider>
          <App>{children}</App>

          {/* <CartSideBar/>
      <Navbar/>
      <Suspense>
        <main>{children}</main>
      </Suspense> */}
        </StoreProvider>
        <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
