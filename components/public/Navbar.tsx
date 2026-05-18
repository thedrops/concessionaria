"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`bg-[#012456] text-white shadow-lg sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-2xl backdrop-blur-sm bg-[#012456]/95" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <span className="font-display font-bold text-2xl tracking-wide group-hover:text-accent-400 transition-colors">
                Israel Veículos
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="relative hover:text-accent-400 transition-all group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/catalogo"
              className="relative hover:text-accent-400 transition-all group"
            >
              Catálogo
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-400 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/sobre"
              className="relative hover:text-accent-400 transition-all group"
            >
              Sobre
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-400 transition-all group-hover:w-full"></span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-accent-400 transition-colors p-2"
              aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            >
              <div className="relative w-6 h-6">
                <Menu
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                    isOpen ? "opacity-0 rotate-180" : "opacity-100 rotate-0"
                  }`}
                />
                <X
                  className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                    isOpen ? "opacity-100 rotate-0" : "opacity-0 rotate-180"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary-700 shadow-inner">
          <Link
            href="/"
            className="block px-3 py-2 rounded-md hover:bg-primary-600 transition-all transform hover:translate-x-1"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/catalogo"
            className="block px-3 py-2 rounded-md hover:bg-primary-600 transition-all transform hover:translate-x-1"
            onClick={() => setIsOpen(false)}
          >
            Catálogo
          </Link>
          <Link
            href="/sobre"
            className="block px-3 py-2 rounded-md hover:bg-primary-600 transition-all transform hover:translate-x-1"
            onClick={() => setIsOpen(false)}
          >
            Sobre
          </Link>
        </div>
      </div>
    </nav>
  );
}
