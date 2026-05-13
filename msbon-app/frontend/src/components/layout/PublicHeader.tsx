import { Link, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import MobileMenu from "./MobileMenu";

const NAV_ITEMS = [
  { to: "/impact",        label: "Impact" },
  { to: "/how-it-works",  label: "How it works" },
  { to: "/glossary",      label: "Glossary" },
  { to: "/contact",       label: "Contact" },
];

export default function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <>
      <header className="bg-cream border-b border-charcoal-faint sticky top-0 z-30 backdrop-blur-sm bg-cream/90">
        <div className="container-editorial flex items-center justify-between h-16 md:h-20">
          <Link
            to="/"
            className="font-display text-body-md text-charcoal hover:text-terracotta transition-colors"
            style={{ fontVariationSettings: '"opsz" 9, "wght" 400' }}
          >
            MSBON&nbsp;<span className="text-charcoal-muted">·</span>&nbsp;Verification
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `nav-underline font-sans text-label uppercase tracking-wider transition-colors duration-200 ${
                    isActive ? "text-terracotta" : "text-charcoal hover:text-terracotta"
                  }`
                }
                data-active={pathname === item.to ? "true" : "false"}
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/app/login"
              className="font-sans text-label uppercase tracking-wider text-charcoal hover:text-terracotta transition-colors duration-200"
            >
              Sign in
            </Link>
          </nav>

          {/* Mobile trigger */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="md:hidden font-sans text-label uppercase tracking-wider text-charcoal min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            Menu
          </button>
        </div>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={[{ to: "/", label: "Home" }, ...NAV_ITEMS, { to: "/app/login", label: "Sign in" }]}
        ctaTo="/contact"
        ctaLabel="Get in touch"
      />
    </>
  );
}
