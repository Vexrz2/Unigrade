"use client";

import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '../context/UserContext';
import _ from 'lodash';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const ctx = useContext(UserContext);
  const router = useRouter();

  if (!ctx) return <>{children}</>;

  const { user, loading } = ctx;

  useEffect(() => {
    if (!loading && _.isEmpty(user)) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) return <div>Loading...</div>;

  return !_.isEmpty(user) ? <>{children}</> : null;
}
