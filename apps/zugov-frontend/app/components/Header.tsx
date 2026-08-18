import { Link, useLocation } from "react-router-dom";
import { PrivyConnectButton } from "./PrivyConnectButton";
import { Search } from "lucide-react";

export function Header() {
  const { pathname } = useLocation();

  const navItems = [
    { to: "/", label: "Explore" },
    { to: "/proposals", label: "Proposals" },
    { to: "/delegates", label: "Delegates" },
    { to: "/analytics", label: "Analytics" },
    { to: "/knowledge-base", label: "Knowledge Base" },
    { to: "/about", label: "About" },
  ];

  return (
    <header className="border-b border-gray-700 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
                <rect width="32" height="32" rx="7" fill="#16161a" />
                <path d="M6,6 L26,6 L26,11 L14,21 L26,21 L26,26 L6,26 L6,21 L18,11 L6,11 Z" fill="#648DAF" />
              </svg>
              <span className="font-[600] text-xl text-white" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                ZuGov
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.to ? "text-[#86A6C1]" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-gray-300">
              <Search className="w-5 h-5" />
            </button>
            <PrivyConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
