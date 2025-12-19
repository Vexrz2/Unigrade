"use client";

import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { UserContext } from '@/context/UserContext';
import { FiCheck, FiX, FiBook, FiPlus, FiClock, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';
import type { Course } from '@/types';

export default function AdminCoursesPage() {
  const router = useRouter();
  const ctx = useContext(UserContext);
  const user = ctx?.user;
  const loading = ctx?.loading;

  const [pendingSuggestions, setPendingSuggestions] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Add course form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    courseCode: '',
    credits: 3,
    department: '',
    description: '',
  });

  // Check if user is admin
  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Fetch pending suggestions
  useEffect(() => {
    if (user?.isAdmin) {
      fetchSuggestions();
    }
  }, [user]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/course-database');
      setPendingSuggestions(res.data.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      toast.error('Failed to load pending suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (suggestionId: string) => {
    setProcessingId(suggestionId);
    try {
      await api.post(`/admin/course-database/approve/${suggestionId}`);
      toast.success('Course approved and added to database!');
      setPendingSuggestions(prev => prev.filter(s => s._id !== suggestionId));
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      toast.error(errorResponse?.response?.data?.message || 'Failed to approve suggestion');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (suggestionId: string) => {
    const reason = prompt('Reason for rejection (optional):');
    setProcessingId(suggestionId);
    try {
      await api.post(`/admin/course-database/reject/${suggestionId}`, { reason });
      toast.success('Suggestion rejected');
      setPendingSuggestions(prev => prev.filter(s => s._id !== suggestionId));
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      toast.error(errorResponse?.response?.data?.message || 'Failed to reject suggestion');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.courseName.trim()) {
      toast.error('Course name is required');
      return;
    }
    try {
      await api.post('/admin/course-database', newCourse);
      toast.success('Course added to database!');
      setNewCourse({
        courseName: '',
        courseCode: '',
        credits: 3,
        department: '',
        description: '',
      });
      setShowAddForm(false);
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      toast.error(errorResponse?.response?.data?.message || 'Failed to add course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme2">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme3"></div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-theme2 px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Course Database Admin</h1>
          <p className="text-gray-600">Manage course suggestions and add new courses</p>
        </div>

        {/* Add Course Button/Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 text-theme3 hover:text-blue-600 font-medium transition-colors"
            >
              <FiPlus /> Add a new course to the database
            </button>
          ) : (
            <form onSubmit={handleAddCourse} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Course</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Name *</label>
                  <input
                    type="text"
                    value={newCourse.courseName}
                    onChange={(e) => setNewCourse({ ...newCourse, courseName: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                  <input
                    type="text"
                    value={newCourse.courseCode}
                    onChange={(e) => setNewCourse({ ...newCourse, courseCode: e.target.value })}
                    placeholder="e.g., CS101"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                  <input
                    type="number"
                    value={newCourse.credits}
                    onChange={(e) => setNewCourse({ ...newCourse, credits: Number(e.target.value) })}
                    min={1}
                    max={20}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newCourse.department}
                    onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                    placeholder="e.g., Computer Science"
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-theme3 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Course
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Pending Suggestions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <FiClock className="text-yellow-500 text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">
              Pending Suggestions ({pendingSuggestions.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme3"></div>
            </div>
          ) : pendingSuggestions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending suggestions</p>
          ) : (
            <div className="space-y-4">
              {pendingSuggestions.map((suggestion) => (
                <div
                  key={suggestion._id}
                  className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FiBook className="text-theme3" />
                      <h4 className="font-medium text-gray-800">{suggestion.name}</h4>
                      {suggestion.code && (
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{suggestion.code}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{suggestion.credits} credits</span>
                      {suggestion.department && <span>• {suggestion.department}</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <FiUser size={12} />
                      <span>Suggested by user: {suggestion.createdBy?.username ?? "Unknown"}</span>
                      <span>• {new Date(suggestion.createdAt || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(suggestion._id!)}
                      disabled={processingId === suggestion._id}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                      title="Approve"
                    >
                      <FiCheck size={20} />
                    </button>
                    <button
                      onClick={() => handleReject(suggestion._id!)}
                      disabled={processingId === suggestion._id}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
