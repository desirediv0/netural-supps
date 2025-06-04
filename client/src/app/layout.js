import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "sonner";
import { RouteGuard } from "@/components/route-guard";
import { ClientOnly } from "@/components/client-only";

const jostFont = localFont({
  src: "./fonts/Jost-Regular.ttf",
  variable: "--font-jost",
  weight: "400",
  display: "swap",
});

const poppinsFont = localFont({
  src: "./fonts/Poppins-Regular.ttf",
  variable: "--font-poppins",
  weight: "400",
  display: "swap",
});

export const metadata = {
  title: "Natural supp - Premium Supplements for Your Fitness Journey",
  description:
    "Get high-quality supplements at the best prices. Free shipping on orders over ₹999.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${jostFont.variable} ${poppinsFont.variable} font-jost antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">
                <ClientOnly>
                  <RouteGuard>{children}</RouteGuard>
                </ClientOnly>
              </main>
              <Footer />
            </div>
            <Toaster position="top-center" richColors closeButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
