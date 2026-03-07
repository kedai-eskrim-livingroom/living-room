import { Poppins } from "next/font/google";
import "./globals.css";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata = {
  title: "Living Room Ice Cream",
  description: "POS PWA Application",
  icons: {
    icon: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Kedai Ice Cream Living Room",
    images: [
      {
        url: "/og-image.png",
        width: 320,
        height: 640,
        alt: "Kedai Ice Cream Living Room",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
