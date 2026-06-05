import type { Metadata } from "next";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { ToastContainer } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "MedCore — Hospital Management System",
  description: "Visually stunning, premium Hospital Management System dashboard and operations control center.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('medcore-theme');
                if (t === 'light') {
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.remove('light');
                }
              } catch (e) {}
            `
          }}
        />
      </head>
      <body className="antialiased font-sans bg-background text-foreground min-h-screen relative">
        <MainLayout>{children}</MainLayout>

        {/* Global Toast Alerts */}
        <ToastContainer />
      </body>
    </html>
  );
}


