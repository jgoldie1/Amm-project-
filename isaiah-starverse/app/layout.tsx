import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Isaiah AI Starverse — Anyone Can Be A Star",
  description: "Faith-centered talent discovery platform. Higfield Dance 2.0 · Mythos Blender · Messiah AI MD · AI TV · Online Showcases · Parent & Child Programs",
  keywords: ["talent discovery","Isaiah AI","Starverse","dance","music","sports","faith","youth","anyone can be a star"],
  openGraph: {
    title: "Isaiah AI Starverse",
    description: "Anyone Can Be A Star — discover, develop, and showcase talent",
    type: "website",
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
