"use client";

import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { UserContext } from '../../context/UserContext';
import api from '../../lib/api';
import { IoIosSearch } from 'react-icons/io';
import { EmploymentTypes } from '../../components/misc/SelectOptions';
import { TfiLocationPin } from 'react-icons/tfi';
import { FaSuitcase, FaHeart, FaRegHeart, FaExternalLinkAlt, FaLightbulb, FaGraduationCap, FaCheckCircle } from 'react-icons/fa';
import { BiTargetLock } from 'react-icons/bi';
import { MdTipsAndUpdates } from 'react-icons/md';
import { HiDocumentText } from 'react-icons/hi';
import type { JobListing } from '@/types';
import { JobListSkeleton } from '@/components/Skeleton';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useSavedJobs, useToggleSaveJob } from '@/hooks/useSavedJobs';

// Skills commonly associated with majors
const MAJOR_SKILLS: Record<string, string[]> = {
  'Computer Science': ['Python', 'JavaScript', 'Java', 'SQL', 'Git', 'React', 'Node.js', 'Data Structures', 'Algorithms'],
  'Business Administration': ['Excel', 'PowerPoint', 'Financial Analysis', 'Marketing', 'Project Management', 'Leadership'],
  'Electrical Engineering': ['MATLAB', 'C/C++', 'Circuit Design', 'AutoCAD', 'Signal Processing', 'Embedded Systems'],
  'Mechanical Engineering': ['SolidWorks', 'AutoCAD', 'MATLAB', 'Thermodynamics', '3D Printing', 'CAD/CAM'],
  'Mathematics': ['Python', 'R', 'MATLAB', 'Statistical Analysis', 'LaTeX', 'Machine Learning'],
  'Physics': ['Python', 'MATLAB', 'LabVIEW', 'Data Analysis', 'Research Methods', 'Scientific Writing'],
  'Economics': ['Excel', 'R', 'Stata', 'Statistical Analysis', 'Data Visualization', 'Econometrics'],
  'Psychology': ['SPSS', 'Research Methods', 'Statistical Analysis', 'Communication', 'Data Collection'],
  'Chemistry': ['Lab Techniques', 'Spectroscopy', 'ChemDraw', 'Research Methods', 'Safety Protocols'],
  'default': ['Communication', 'Problem Solving', 'Teamwork', 'Time Management', 'Microsoft Office'],
};

// Interview tips by major
const INTERVIEW_TIPS: Record<string, string[]> = {
  'Computer Science': [
    'Practice coding problems on LeetCode or HackerRank',
    'Be ready to explain your projects and technical decisions',
    'Review data structures and algorithms fundamentals',
    'Prepare for system design questions for senior roles',
  ],
  'Business Administration': [
    'Prepare case study responses using frameworks like SWOT',
    'Have examples of leadership and teamwork ready',
    'Research the company\'s financial performance and market position',
    'Practice behavioral questions using the STAR method',
  ],
  'default': [
    'Research the company thoroughly before the interview',
    'Prepare questions to ask the interviewer',
    'Practice the STAR method for behavioral questions',
    'Dress appropriately and arrive 10-15 minutes early',
    'Follow up with a thank-you email within 24 hours',
  ],
};

// Resume tips by major
const RESUME_TIPS: Record<string, string[]> = {
  'Computer Science': [
    'Include links to your GitHub profile and portfolio',
    'List specific technologies and programming languages you know',
    'Quantify your impact (e.g., "Improved load time by 40%")',
    'Include relevant personal projects and open-source contributions',
  ],
  'Business Administration': [
    'Highlight leadership roles and quantifiable achievements',
    'Include relevant certifications (CPA, PMP, etc.)',
    'Emphasize internships and real-world business experience',
    'Show progression and increasing responsibility',
  ],
  'default': [
    'Keep it to one page for entry-level positions',
    'Use action verbs to describe your experiences',
    'Tailor your resume to each job application',
    'Include relevant coursework and academic projects',
    'Proofread carefully for grammar and spelling errors',
  ],
};

export default function CareerPlanPage() {
  const ctx = useContext(UserContext);
  const user = ctx?.user ?? null;
  const [formData, setFormData] = useState({ employmentType: 'INTERN', location: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'resources'>('search');
  const [hasSearched, setHasSearched] = useState(false);

  // Use Tanstack Query for saved jobs
  const { data: savedJobsData = [] } = useSavedJobs();
  const toggleSaveJobMutation = useToggleSaveJob();

  const { employmentType, location } = formData;
  const userMajor = user?.degree?.major ?? 'default';

  // Get skills for user's major
  const relevantSkills = useMemo(() => {
    return MAJOR_SKILLS[userMajor] ?? MAJOR_SKILLS['default'];
  }, [userMajor]);

  // Get tips for user's major
  const interviewTips = useMemo(() => {
    return INTERVIEW_TIPS[userMajor] ?? INTERVIEW_TIPS['default'];
  }, [userMajor]);

  const resumeTips = useMemo(() => {
    return RESUME_TIPS[userMajor] ?? RESUME_TIPS['default'];
  }, [userMajor]);

  // Calculate match score for a job based on major
  const calculateMatchScore = useCallback((job: JobListing) => {
    const jobText = `${job.job_title ?? ''} ${job.job_description ?? ''} ${job.job_required_skills?.join(' ') ?? ''}`.toLowerCase();
    const majorKeywords = relevantSkills.map(s => s.toLowerCase());
    
    let matches = 0;
    majorKeywords.forEach(keyword => {
      if (jobText.includes(keyword)) matches++;
    });
    
    return Math.min(Math.round((matches / majorKeywords.length) * 100), 100);
  }, [relevantSkills]);

  // Extract missing skills from job
  const getMissingSkills = useCallback((job: JobListing) => {
    const jobText = `${job.job_title ?? ''} ${job.job_description ?? ''} ${job.job_required_skills?.join(' ') ?? ''}`.toLowerCase();
    const userSkills = relevantSkills.map(s => s.toLowerCase());
    
    // Common skills employers look for
    const commonSkills = ['python', 'javascript', 'sql', 'excel', 'communication', 'leadership', 'teamwork', 'project management'];
    
    return commonSkills.filter(skill => 
      jobText.includes(skill) && !userSkills.some(us => us.includes(skill))
    ).slice(0, 3);
  }, [relevantSkills]);

  // Toggle save job using mutation
  const toggleSaveJob = (job: JobListing) => {
    toggleSaveJobMutation.mutate(job);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => 
    setFormData({ ...formData, [e.target.name]: e.target.value } as typeof formData);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      toast.error('Please enter a location');
      return;
    }
    try {
      setIsLoading(true);
      setHasSearched(true);
      const requestQuery = searchQuery + ' in ' + location;
      const res = await api.post('/jobs/get-job-listings', {
        queryParams: {
          query: requestQuery,
          date_posted: 'month',
          num_pages: 5,
          radius: 50,
          employment_types: employmentType,
        }
      });
      setJobListings(res.data?.data ?? []);
      if (res.data?.data?.length > 0) {
        toast.success(`Found ${res.data.data.length} jobs`);
      } else {
        toast.error('No jobs found. Try different search terms.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

  useEffect(() => {
    if (user?.degree) setSearchQuery(user.degree.major ?? '');
  }, [user]);

  // Get saved job listings
  const savedJobListings = useMemo(() => {
    return savedJobsData;
  }, [savedJobsData]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-theme2 px-4 py-12">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800  mb-2">Career Planner</h1>
          <p className='text-gray-600  text-lg'>Find jobs and internships tailored to your {userMajor !== 'default' ? userMajor : ''} background</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-theme3 text-white shadow-md'
                : 'bg-white  text-gray-700  hover:bg-gray-100 :bg-dark-card-hover'
            }`}
          >
            <IoIosSearch className="inline mr-2" />
            Search Jobs
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'saved'
                ? 'bg-theme3 text-white shadow-md'
                : 'bg-white  text-gray-700  hover:bg-gray-100 :bg-dark-card-hover'
            }`}
          >
            <FaHeart className="inline mr-2" />
            Saved ({savedJobsData.length})
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'resources'
                ? 'bg-theme3 text-white shadow-md'
                : 'bg-white  text-gray-700  hover:bg-gray-100 :bg-dark-card-hover'
            }`}
          >
            <FaLightbulb className="inline mr-2" />
            Career Resources
          </button>
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <>
            {/* Search Form */}
            <div className="bg-white  rounded-lg shadow-md p-6 mb-6">
              <form onSubmit={onSubmit} className='flex flex-col lg:flex-row gap-4 items-end'>
                <div className="flex-1 w-full">
                  <label className='block text-gray-700  text-sm font-semibold mb-2'>Job Title / Keywords</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <IoIosSearch size={20} />
                    </div>
                    <input 
                      value={searchQuery} 
                      onChange={handleSearch} 
                      type="search" 
                      placeholder="e.g., Software Engineer, Marketing..."
                      className="block w-full p-3 pl-10 text-gray-900  border-2 border-gray-200  rounded-lg bg-white  focus:border-theme3 focus:outline-none transition-colors" 
                    />
                  </div>
                </div>

                <div className="w-full lg:w-48">
                  <label className='block text-gray-700  text-sm font-semibold mb-2'>Employment Type</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <FaSuitcase size={16} />
                    </div>
                    <select 
                      value={employmentType} 
                      name='employmentType' 
                      onChange={onChange} 
                      className="block w-full p-3 pl-10 text-gray-900  border-2 border-gray-200  rounded-lg bg-white  focus:border-theme3 focus:outline-none transition-colors appearance-none"
                    >
                      <EmploymentTypes />
                    </select>
                  </div>
                </div>

                <div className="w-full lg:w-48">
                  <label className='block text-gray-700  text-sm font-semibold mb-2'>Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <TfiLocationPin size={16} />
                    </div>
                    <input 
                      type="text" 
                      name="location" 
                      value={location} 
                      onChange={onChange} 
                      placeholder="City or Country"
                      className="block w-full p-3 pl-10 text-gray-900  border-2 border-gray-200  rounded-lg bg-white  focus:border-theme3 focus:outline-none transition-colors" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className='w-full lg:w-auto bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50'
                >
                  {isLoading ? 'Searching...' : 'Search Jobs'}
                </button>
              </form>
            </div>

            {/* Skills Match Card */}
            {userMajor !== 'default' && (
              <div className="bg-white  rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800  mb-3 flex items-center gap-2">
                  <BiTargetLock className="text-theme3" />
                  Your {userMajor} Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {relevantSkills.map((skill, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-theme2  text-gray-700  rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Results */}
            {isLoading ? (
              <JobListSkeleton count={6} />
            ) : jobListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobListings.map((job, idx) => {
                  const matchScore = calculateMatchScore(job);
                  const missingSkills = getMissingSkills(job);
                  const isSaved = savedJobsData.some(savedJob => savedJob.job_id === job.job_id);
                  
                  return (
                    <div 
                      key={job.job_id ?? idx} 
                      className="bg-white  rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100  relative"
                    >
                      {/* Save Button */}
                      <button
                        onClick={() => toggleSaveJob(job)}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 :bg-dark-card-hover rounded-full transition-colors"
                        aria-label={isSaved ? 'Remove from saved' : 'Save job'}
                      >
                        {isSaved ? (
                          <FaHeart className="text-red-500" size={18} />
                        ) : (
                          <FaRegHeart className="text-gray-400" size={18} />
                        )}
                      </button>

                      {/* Company Logo & Title */}
                      <div className="flex items-start gap-4 mb-4 pr-8">
                        <div className="w-14 h-14 bg-gray-100  rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                          {job.employer_logo ? (
                            <Image 
                              src={job.employer_logo} 
                              alt={job.employer_name ?? 'Company Logo'} 
                              width={56}
                              height={56}
                              className="object-contain w-14 h-14"
                            />
                          ) : (
                            <FaSuitcase className="text-gray-400" size={24} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-800  truncate" title={job.job_title ?? job.job_job_title}>
                            {(job.job_title ?? job.job_job_title ?? 'Job Title').slice(0, 40)}
                            {(job.job_title ?? job.job_job_title ?? '').length > 40 ? '...' : ''}
                          </h3>
                          <p className="text-gray-600  text-sm truncate">{job.employer_name}</p>
                          <p className="text-gray-500  text-sm">
                            {job.job_city}{job.job_city && job.job_country ? ', ' : ''}{job.job_country}
                          </p>
                        </div>
                      </div>

                      {/* Match Score */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-600 ">Match Score</span>
                          <span className={`text-sm font-bold ${
                            matchScore >= 70 ? 'text-green-600' : 
                            matchScore >= 40 ? 'text-yellow-600' : 'text-gray-500'
                          }`}>
                            {matchScore}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200  rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              matchScore >= 70 ? 'bg-green-500' : 
                              matchScore >= 40 ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${matchScore}%` }}
                          />
                        </div>
                      </div>

                      {/* Missing Skills */}
                      {missingSkills.length > 0 && (
                        <div className="mb-4 p-3 bg-yellow-50  rounded-lg">
                          <p className="text-xs font-medium text-yellow-800  mb-1">
                            <MdTipsAndUpdates className="inline mr-1" />
                            Skills to learn:
                          </p>
                          <p className="text-xs text-yellow-700 ">
                            {missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
                          </p>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-2 py-1 bg-theme2  text-gray-700  rounded text-xs">
                          {employmentType === 'FULLTIME' ? 'Full Time' : 
                           employmentType === 'PARTTIME' ? 'Part Time' : 
                           employmentType === 'INTERN' ? 'Internship' : 
                           employmentType === 'CONTRACTOR' ? 'Contract' : employmentType}
                        </span>
                        {job.job_apply_quality_score && (
                          <span className="px-2 py-1 bg-green-100  text-green-700  rounded text-xs">
                            ⭐ {(job.job_apply_quality_score * 5).toFixed(1)}
                          </span>
                        )}
                      </div>

                      {/* Apply Button */}
                      <a 
                        href={job.job_apply_link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-theme3 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Apply Now
                        <FaExternalLinkAlt size={12} />
                      </a>
                    </div>
                  );
                })}
              </div>
            ) : hasSearched ? (
              <div className="bg-white  rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800  mb-2">No jobs found</h3>
                <p className="text-gray-600 ">Try adjusting your search terms or location</p>
              </div>
            ) : (
              <div className="bg-white  rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">💼</div>
                <h3 className="text-xl font-semibold text-gray-800  mb-2">Start your job search</h3>
                <p className="text-gray-600 ">Enter a location and click search to find opportunities</p>
              </div>
            )}
          </>
        )}

        {/* Saved Tab */}
        {activeTab === 'saved' && (
          <div>
            {savedJobListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedJobListings.map((job, idx) => (
                  <div 
                    key={job.job_id ?? idx} 
                    className="bg-white  rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100  relative"
                  >
                    <button
                      onClick={() => toggleSaveJob(job)}
                      className="absolute top-4 right-4 p-2 hover:bg-gray-100 :bg-dark-card-hover rounded-full transition-colors"
                    >
                      <FaHeart className="text-red-500" size={18} />
                    </button>

                    <div className="flex items-start gap-4 mb-4 pr-8">
                      <div className="w-14 h-14 bg-gray-100  rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                        {job.employer_logo ? (
                          <Image 
                            src={job.employer_logo} 
                            alt={job.employer_name ?? 'Company'} 
                            width={56}
                            height={56}
                            className="object-contain w-14 h-14"
                          />
                        ) : (
                          <FaSuitcase className="text-gray-400" size={24} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-800  truncate">
                          {(job.job_title ?? job.job_job_title ?? 'Job Title').slice(0, 40)}
                        </h3>
                        <p className="text-gray-600  text-sm">{job.employer_name}</p>
                        <p className="text-gray-500  text-sm">
                          {job.job_city}{job.job_city && job.job_country ? ', ' : ''}{job.job_country}
                        </p>
                      </div>
                    </div>

                    <a 
                      href={job.job_apply_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-theme3 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Apply Now
                      <FaExternalLinkAlt size={12} />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white  rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">❤️</div>
                <h3 className="text-xl font-semibold text-gray-800  mb-2">No saved jobs yet</h3>
                <p className="text-gray-600  mb-4">Save jobs from your search to review them later</p>
                <button 
                  onClick={() => setActiveTab('search')}
                  className="bg-theme3 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Start Searching
                </button>
              </div>
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Tips */}
            <div className="bg-white  rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800  mb-4 flex items-center gap-2">
                <HiDocumentText className="text-theme3" />
                Resume Tips {userMajor !== 'default' && `for ${userMajor}`}
              </h3>
              <ul className="space-y-3">
                {resumeTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <FaCheckCircle className="text-green-500 mt-1 shrink-0" />
                    <span className="text-gray-700 ">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Interview Tips */}
            <div className="bg-white  rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800  mb-4 flex items-center gap-2">
                <FaGraduationCap className="text-theme3" />
                Interview Prep {userMajor !== 'default' && `for ${userMajor}`}
              </h3>
              <ul className="space-y-3">
                {interviewTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <FaCheckCircle className="text-blue-500 mt-1 shrink-0" />
                    <span className="text-gray-700 ">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills to Develop */}
            <div className="bg-white  rounded-lg shadow-md p-6 lg:col-span-2">
              <h3 className="text-xl font-bold text-gray-800  mb-4 flex items-center gap-2">
                <FaLightbulb className="text-yellow-500" />
                In-Demand Skills for {userMajor !== 'default' ? userMajor : 'Your Field'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relevantSkills.map((skill, i) => (
                  <div 
                    key={i} 
                    className="p-4 bg-gray-50  rounded-lg text-center hover:shadow-md transition-shadow"
                  >
                    <span className="font-medium text-gray-800 ">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white  rounded-lg shadow-md p-6 lg:col-span-2">
              <h3 className="text-xl font-bold text-gray-800  mb-4">
                🔗 Helpful Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a 
                  href="https://www.linkedin.com/learning/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-4 bg-blue-50  rounded-lg hover:shadow-md transition-all group"
                >
                  <h4 className="font-semibold text-blue-700  group-hover:underline">LinkedIn Learning</h4>
                  <p className="text-sm text-blue-600 ">Online courses for skill development</p>
                </a>
                <a 
                  href="https://www.glassdoor.com/Interview/index.htm" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-4 bg-green-50  rounded-lg hover:shadow-md transition-all group"
                >
                  <h4 className="font-semibold text-green-700  group-hover:underline">Glassdoor</h4>
                  <p className="text-sm text-green-600 ">Interview questions & company reviews</p>
                </a>
                <a 
                  href="https://www.indeed.com/career-advice" 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-4 bg-purple-50  rounded-lg hover:shadow-md transition-all group"
                >
                  <h4 className="font-semibold text-purple-700  group-hover:underline">Indeed Career Guide</h4>
                  <p className="text-sm text-purple-600 ">Career advice & resume tips</p>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
