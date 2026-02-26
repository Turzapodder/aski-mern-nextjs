import type { Metadata } from "next";
import StoreProvider from "./StoreProvider";
import "./globals.css";
import { Poppins, Orbitron, Dancing_Script, Space_Grotesk } from 'next/font/google'
import { Toaster } from "@/components/ui/sonner"

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing-script',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
})

export const metadata: Metadata = {
  title: {
    template: "%s | Aski",
    default: "Aski — Learn from Expert Tutors",
  },
  description:
    "Aski connects students with expert tutors. Submit assignments, find tutors, and track your academic progress — all in one platform.",
  keywords: ["tutoring", "assignments", "online learning", "students", "tutors"],
  authors: [{ name: "Aski" }],
  openGraph: {
    title: "Aski — Learn from Expert Tutors",
    description: "Submit assignments, find tutors, and track your academic progress.",
    type: "website",
    siteName: "Aski",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aski — Learn from Expert Tutors",
    description: "Submit assignments, find tutors, and track your academic progress.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${poppins.variable} ${orbitron.variable} ${dancingScript.variable}`}>
      <body
        className="bg-background font-sans" >
        <StoreProvider>
          {children}
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  )
}
