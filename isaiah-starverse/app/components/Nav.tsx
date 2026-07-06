"use client"
import Link from "next/link"

const links = [
  { href: "/",               label: "Home"          },
  { href: "/starverse",      label: "⭐ Starverse"   },
  { href: "/showcase",       label: "🎭 Showcase"    },
  { href: "/higfield-dance", label: "💃 Dance 2.0"   },
  { href: "/mythos",         label: "🎵 Mythos"      },
  { href: "/studio",         label: "🔴 Live Studio" },
  { href: "/tv",             label: "📺 AI TV"       },
  { href: "/movies",         label: "🎬 Movies"      },
  { href: "/profile",        label: "👤 Profile"     },
  { href: "/audition",       label: "🎤 Audition"    },
  { href: "/admin",          label: "⚙️ Admin"       },
]

export default function Nav() {
  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">ISAIAH AI ⭐</Link>
      <div className="navlinks">
        {links.map(l => <Link key={l.href} href={l.href}>{l.label}</Link>)}
      </div>
    </nav>
  )
}
