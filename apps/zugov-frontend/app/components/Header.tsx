import { Link, useLocation } from "react-router-dom";
import { ConnectButton } from "@rainbow-me/rainbowkit";
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
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              ZuGov
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-medium transition-colors ${
                    pathname === item.to ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Search className="w-5 h-5" />
            </button>
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
