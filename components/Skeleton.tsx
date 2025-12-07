import React from 'react';

// Generic skeleton wrapper with pulse animation
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton rounded bg-gray-200 ${className}`} />
  );
}

// Course card skeleton
export function CourseCardSkeleton() {
  return (
    <div className="bg-gray-50 m-2 border border-gray-200 rounded-lg shadow-sm p-4 flex items-center justify-between">
      <div className="flex flex-col flex-1 gap-2">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="flex flex-col gap-2 ml-4">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

// Course list skeleton (multiple cards)
export function CourseListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: count }).map((_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Job card skeleton
export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <div className="flex items-start gap-4">
        <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-4 flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

// Job list skeleton (grid)
export function JobListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Dashboard card skeleton
export function DashboardCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-40" />
      </div>
      <Skeleton className="h-10 w-24 mb-6" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

// Stats row skeleton (uses 4 cards for secondary stats)
export function StatsRowSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-5 text-center">
          <Skeleton className="h-6 w-6 mx-auto mb-2 rounded-full" />
          <Skeleton className="h-8 w-16 mx-auto mb-1" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Form skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}

// Profile page skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      {/* Account Information skeleton */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <FormSkeleton fields={3} />
      </div>
      {/* Security skeleton */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
      {/* Danger Zone skeleton */}
      <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-red-500">
        <Skeleton className="h-8 w-36 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Text block skeleton
export function TextBlockSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
        />
      ))}
    </div>
  );
}

export default Skeleton;
