"use client";

import React, { useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import _ from 'lodash';
import { UserContext } from '../context/UserContext';
import faviconImage from '../app/favicon.png';

export default function Navbar() {
  const ctx = useContext(UserContext);
  const user = ctx?.user ?? null;
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const getNavLinkClass = (path: string) => {
    const base = "px-4 py-2 rounded-lg transition-colors duration-200 font-medium";
    return isActive(path) 
      ? `${base} bg-theme3 text-white` 
      : `${base} text-gray-200 hover:text-white`;
  };

  if (!_.isEmpty(user)) {
    return (
      <nav className="navbar bg-linear-to-r from-theme4 to-theme4 shadow-md border-b border-theme3">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image src={faviconImage} alt="Unigrade Logo" width={40} height={40} className="rounded-lg" />
            <Link href="/" className="text-2xl font-bold text-white hover:text-gray-100 transition-colors">
              Unigrade
            </Link>
          </div>
          <ul className="flex flex-row gap-1 items-center">
            <li><Link href="/" className={getNavLinkClass('/')}>Home</Link></li>
            <li><Link href="/dashboard" className={getNavLinkClass('/dashboard')}>Dashboard</Link></li>
            <li><Link href="/courses" className={getNavLinkClass('/courses')}>Courses</Link></li>
            <li><Link href="/study-plan" className={getNavLinkClass('/study-plan')}>Study Plan</Link></li>
            <li><Link href="/career-plan" className={getNavLinkClass('/career-plan')}>Career Planner</Link></li>
            <li className="ml-auto"><Link href="/profile" className={getNavLinkClass('/profile')}>Profile</Link></li>
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar bg-linear-to-r from-theme4 to-theme4 shadow-md border-b border-theme3">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src={faviconImage} alt="Unigrade Logo" width={40} height={40} className="rounded-lg" />
          <Link href="/" className="text-2xl font-bold text-white hover:text-gray-100 transition-colors">
            Unigrade
          </Link>
        </div>
        <ul className="flex gap-4 items-center">
          <li><Link href="/" className={getNavLinkClass('/')}>Home</Link></li>
          <li><Link href="/register" className={getNavLinkClass('/register')}>Register</Link></li>
          <li><Link href="/login" className={getNavLinkClass('/login')}>Login</Link></li>
        </ul>
      </div>
    </nav>
  );
}
