"use client";

import React, { useContext } from 'react';
import Link from 'next/link';
import _ from 'lodash';
import { UserContext } from '../context/UserContext';

export default function Navbar() {
  const ctx = useContext(UserContext);
  const user = ctx?.user ?? null;

  if (!_.isEmpty(user)) {
    return (
      <nav className="navbar bg-theme4 border-gray-200 flex justify-between pl-10">
        <div className="self-center w-1/4">
          <span className="xl:text-2xl text-lg text-gray-100"><Link href="/">Unigrade - Website for students</Link></span>
        </div>
        <ul className="flex flex-row p-4 w-3/4">
          <li className='block mx-2 py-2 px-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded text-xl'><Link href="/">Home</Link></li>
          <li className='block mx-2 py-2 px-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded text-xl'><Link href="/dashboard">Dashboard</Link></li>
          <li className='block mx-2 py-2 px-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded text-xl'><Link href="/courses">Courses</Link></li>
          <li className='block mx-2 py-2 px-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded text-xl'><Link href="/study-plan">Study plan</Link></li>
          <li className='block mx-2 py-2 px-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded text-xl'><Link href="/career-plan">Career planner</Link></li>
          <li className='block py-2 px-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded text-xl ml-auto'><Link href="/profile">Profile</Link></li>
        </ul>
      </nav>
    );
  }

  return (
    <nav className="navbar bg-theme4 border-gray-200 flex justify-around">
      <div className="self-center">
        <span className="xl:text-2xl text-lg text-gray-100"><Link href="/">Unigrade - Website for students</Link></span>
      </div>
      <ul className="flex space-x-4 flex-row p-4">
        <li className='block py-2 px-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded text-xl'><Link href="/">Home</Link></li>
        <li className='block py-2 px-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded text-xl'><Link href="/register">Register</Link></li>
        <li className='block py-2 px-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded text-xl'><Link href="/login">Login</Link></li>
      </ul>
    </nav>
  );
}
