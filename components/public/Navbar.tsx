"use client";

import Link from "next/link";
import { Car, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-primary-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8" />
              <span className="font-bold text-xl">Concessionária</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="hover:text-accent-400 transition">
              Home
            </Link>
            <Link href="/catalogo" className="hover:text-accent-400 transition">
              Catálogo
            </Link>
            <Link href="/sobre" className="hover:text-accent-400 transition">
              Sobre
            </Link>
            <Link href="/contato" className="hover:text-accent-400 transition">
              Contato
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-accent-400"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary-600">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md hover:bg-primary-700"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/catalogo"
              className="block px-3 py-2 rounded-md hover:bg-primary-700"
              onClick={() => setIsOpen(false)}
            >
              Catálogo
            </Link>
            <Link
              href="/sobre"
              className="block px-3 py-2 rounded-md hover:bg-primary-700"
              onClick={() => setIsOpen(false)}
            >
              Sobre
            </Link>
            <Link
              href="/contato"
              className="block px-3 py-2 rounded-md hover:bg-primary-700"
              onClick={() => setIsOpen(false)}
            >
              Contato
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
