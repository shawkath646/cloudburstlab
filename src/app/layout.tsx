import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getAppData } from "@/actions/database/getMetaData";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const appData = await getAppData();
  return {
    title: {
      template: "%s | " + appData.name,
      default: appData.name
    },
    applicationName: appData.name,
    authors: {
      name: appData.author.name,
      url: new URL(appData.author.portfolio)
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_BASE_URL as string),
    category: "Science",
    creator: `${appData.author.name} <${appData.author.portfolio}>`,
    publisher: "CloudBurst Lab <https://cloudburstlab.vercel.app>",
  };
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
