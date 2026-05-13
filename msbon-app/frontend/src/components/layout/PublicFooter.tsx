import { Link } from "react-router-dom";

const NAV = [
  { to: "/",             label: "Home" },
  { to: "/impact",       label: "Impact" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/contact",      label: "Contact" },
  { to: "/app/login",    label: "Sign in" },
];

export default function PublicFooter() {
  return (
    <footer className="bg-cream-dark border-t border-charcoal-faint section-md">
      <div className="container-editorial flex flex-col gap-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <Link
            to="/"
            className="font-display text-display-md text-charcoal"
            style={{ fontVariationSettings: '"opsz" 36, "wght" 400' }}
          >
            MSBON Verification
          </Link>
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="font-sans text-label uppercase tracking-wider text-charcoal hover:text-terracotta-dark transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-6 border-t border-charcoal-faint">
          <p className="font-sans text-body-sm text-charcoal-muted">
            Built by Team Nexus · University of Southern Mississippi · CSC 424 Capstone, 2026
          </p>
          <p className="font-sans text-body-sm text-charcoal-muted">
            Synthetic data only · No automated licensure decisions
          </p>
        </div>
      </div>
    </footer>
  );
}
