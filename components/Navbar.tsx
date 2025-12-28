"use client";

import React, { useContext, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserContext } from '../context/UserContext';
import faviconImage from '../app/favicon.png';
import { FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const ctx = useContext(UserContext);
  const user = ctx?.user ?? null;
  const loading = ctx?.loading ?? true;
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;
  
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const getNavLinkClass = (path: string) => {
    const base = "px-4 py-2 rounded-lg transition-colors duration-200 font-medium";
    return isActive(path) 
      ? `${base} bg-theme3 text-white` 
      : `${base} text-gray-200 hover:text-white`;
  };

  // Show loading state while user is being fetched
  if (loading) {
    return (
      <nav className="navbar bg-theme4 shadow-md border-b border-theme3 relative">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src={faviconImage} alt="Unigrade Logo" width={40} height={40} className="rounded-lg" />
            <Link href="/" className="text-2xl font-bold text-white hover:text-gray-100 transition-colors">
              Unigrade
            </Link>
          </div>
          {/* Loading skeleton */}
          <div className="hidden md:flex gap-4 items-center">
            <div className="w-80 h-8 bg-theme3/50 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  if (user) {
    return (
      <nav className="navbar bg-theme4 shadow-md border-b border-theme3 relative">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src={faviconImage} alt="Unigrade Logo" width={40} height={40} className="rounded-lg" />
            <Link href="/" className="text-2xl font-bold text-white hover:text-gray-100 transition-colors">
              Unigrade
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <ul className="hidden lg:flex flex-row gap-1 items-center">
            <li><Link href="/dashboard" className={getNavLinkClass('/dashboard')}>Dashboard</Link></li>
            <li><Link href="/courses" className={getNavLinkClass('/courses')}>Courses</Link></li>
            <li><Link href="/study-plan" className={getNavLinkClass('/study-plan')}>Study Plan</Link></li>
            <li><Link href="/career-plan" className={getNavLinkClass('/career-plan')}>Career Planner</Link></li>
            <li className="ml-auto"><Link href="/profile" className={getNavLinkClass('/profile')}>Profile</Link></li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden text-white p-2 hover:bg-theme3 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-theme4 border-t border-theme3 shadow-lg z-50">
            <ul className="flex flex-col py-4 px-6 gap-2">
              <li><Link href="/dashboard" onClick={closeMobileMenu} className={getNavLinkClass('/dashboard') + ' block'}>Dashboard</Link></li>
              <li><Link href="/courses" onClick={closeMobileMenu} className={getNavLinkClass('/courses') + ' block'}>Courses</Link></li>
              <li><Link href="/study-plan" onClick={closeMobileMenu} className={getNavLinkClass('/study-plan') + ' block'}>Study Plan</Link></li>
              <li><Link href="/career-plan" onClick={closeMobileMenu} className={getNavLinkClass('/career-plan') + ' block'}>Career Planner</Link></li>
              <li className="border-t border-theme3 pt-2 mt-2"><Link href="/profile" onClick={closeMobileMenu} className={getNavLinkClass('/profile') + ' block'}>Profile</Link></li>
            </ul>
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav className="navbar bg-theme4 shadow-md border-b border-theme3 relative">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src={faviconImage} alt="Unigrade Logo" width={40} height={40} className="rounded-lg" />
          <Link href="/" className="text-2xl font-bold text-white hover:text-gray-100 transition-colors">
            Unigrade
          </Link>
        </div>
        
        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-4 items-center">
          <li><Link href="/register" className={getNavLinkClass('/register')}>Register</Link></li>
          <li><Link href="/login" className={getNavLinkClass('/login')}>Login</Link></li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-white p-2 hover:bg-theme3 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-theme4 border-t border-theme3 shadow-lg z-50">
          <ul className="flex flex-col py-4 px-6 gap-2">
            <li><Link href="/register" onClick={closeMobileMenu} className={getNavLinkClass('/register') + ' block'}>Register</Link></li>
            <li><Link href="/login" onClick={closeMobileMenu} className={getNavLinkClass('/login') + ' block'}>Login</Link></li>
          </ul>
        </div>
      )}
    </nav>
  );
}
