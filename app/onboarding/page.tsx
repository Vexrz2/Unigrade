"use client";

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { UserContext } from '@/context/UserContext';
import { MajorOptions, DegreeTypes } from '@/components/misc/SelectOptions';
import UniMascot from '@/components/onboarding/UniMascot';
import OnboardingAddCourse from '@/components/onboarding/OnboardingAddCourse';
import { useViewPasswordToggle } from '@/hooks/useViewPasswordToggle';
import { FiEye, FiEyeOff, FiCheck, FiArrowLeft, FiLock, FiUser, FiBook, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { validateUsername, validatePassword, validatePasswordMatch, VALIDATION_RULES } from '@/lib/validation';

type OnboardingStep = 'account' | 'degree' | 'courses';

const STEPS: OnboardingStep[] = ['account', 'degree', 'courses'];

const STEP_INFO = {
  account: { title: 'Create Your Account', icon: FiUser, mascotMood: 'waving' as const },
  degree: { title: 'Tell Us About Your Degree', icon: FiBook, mascotMood: 'thinking' as const },
  courses: { title: 'Add Your Courses', icon: FiCalendar, mascotMood: 'excited' as const },
};

const MASCOT_MESSAGES = {
  account: "Hey there! 👋 Let's get you set up with Unigrade!",
  degree: "Awesome! What are you studying?",
  courses: "Last step! Add some courses to track your progress.",
  complete: "🎉 You're all set! Let's crush those grades!",
};

export default function OnboardingPage() {
  const router = useRouter();
  const ctx = useContext(UserContext);
  const setUser = ctx?.setUser;
  const user = ctx?.user;
  const userLoading = ctx?.loading ?? true;
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('account');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form data - get email from sessionStorage (set by register page)
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [major, setMajor] = useState('');
  const [degreeType, setDegreeType] = useState('');
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [expectedGraduationYear, setExpectedGraduationYear] = useState(new Date().getFullYear() + 4);
  
  const { isPasswordHidden, inputType, toggleViewPassword } = useViewPasswordToggle();
  
  // Year options: 10 years in past to 10 years in future
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  // Load email from sessionStorage on mount
  useEffect(() => {
    // Wait for user context to finish loading before making redirect decisions
    if (userLoading) return;
    
    const storedEmail = sessionStorage.getItem('onboarding_email');
    if (storedEmail) {
      setEmail(storedEmail);
    } else if (!user) {
      // No email in storage and no user, redirect to register
      router.push('/register');
    } else if (user && !user.onboardingCompleted && currentStep === 'account') {
      // Google sign-in case: no need for email, skip to degree step
      setCurrentStep('degree');
    } else if (user && user.onboardingCompleted) {
      // User already completed onboarding, redirect to dashboard
      router.push('/dashboard');
    }
  }, [user, userLoading, router, currentStep]);

  // Redirect if user already completed onboarding
  useEffect(() => {
    if (user?.onboardingCompleted) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const currentStepIndex = STEPS.indexOf(currentStep);
  const stepInfo = STEP_INFO[currentStep];

  const validateAccount = () => {
    const newErrors: Record<string, string> = {};
    
    const usernameResult = validateUsername(username);
    if (!usernameResult.isValid) {
      newErrors.username = usernameResult.error!;
    }
    
    const passwordResult = validatePassword(password);
    if (!passwordResult.isValid) {
      newErrors.password = passwordResult.error!;
    }
    
    const matchResult = validatePasswordMatch(password, confirmPassword);
    if (!matchResult.isValid) {
      newErrors.confirmPassword = matchResult.error!;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDegree = () => {
    const newErrors: Record<string, string> = {};
    if (!major) newErrors.major = VALIDATION_RULES.degree.messages.majorRequired;
    if (!degreeType) newErrors.degreeType = VALIDATION_RULES.degree.messages.typeRequired;
    if (expectedGraduationYear < startYear) {
      newErrors.expectedGraduationYear = VALIDATION_RULES.degree.messages.graduationBeforeStart;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAccountSubmit = async () => {
    if (!validateAccount()) return;
    
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', {
        email,
        username,
        password,
        confirmPassword,
        major: '',
      });
      
      if (setUser) setUser(res.data.user);
      // Clear the stored email from sessionStorage
      sessionStorage.removeItem('onboarding_email');
      toast.success('Account created!');
      setCurrentStep('degree');
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      const message = errorResponse?.response?.data?.message ?? 'Registration failed';
      toast.error(message);
      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDegreeSubmit = async () => {
    if (!validateDegree()) return;
    
    setIsLoading(true);
    try {
      // Update degree info
      await api.patch('/users/update-degree', {
        degreeType,
        major,
        creditRequirement: 120, // default
      });
      
      await api.patch('/users/update-years', {
        startYear,
        expectedGraduationYear,
      });
      
      // Refresh user context
      const profileRes = await api.get('/users/profile');
      if (setUser) setUser(profileRes.data.user);
      
      toast.success('Degree info saved!');
      setCurrentStep('courses');
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      toast.error(errorResponse?.response?.data?.message ?? 'Failed to save degree info');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/onboarding/complete');
      
      // Refresh user context
      const profileRes = await api.get('/users/profile');
      if (setUser) setUser(profileRes.data.user);
      
      toast.success("You're all set! 🎉");
      router.push('/dashboard');
    } catch {
      toast.error('Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  // Handle Enter key for form submission
  const handleKeyDown = (e: React.KeyboardEvent, submitFn: () => void) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      submitFn();
    }
  };

  const renderProgressBar = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, index) => {
        const isActive = index === currentStepIndex;
        const isCompleted = index < currentStepIndex;
        const StepIcon = STEP_INFO[step].icon;
        
        return (
          <React.Fragment key={step}>
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
              ${isCompleted ? 'bg-green-500 text-white' : ''}
              ${isActive ? 'bg-theme3 text-white scale-110 shadow-lg' : ''}
              ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-400' : ''}
            `}>
              {isCompleted ? <FiCheck size={18} /> : <StepIcon size={18} />}
            </div>
            {index < STEPS.length - 1 && (
              <div className={`w-12 h-1 rounded transition-all duration-300 ${
                index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderAccountStep = () => (
    <div className="space-y-5" onKeyDown={(e) => handleKeyDown(e, handleAccountSubmit)}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h2>
      </div>
      
      {errors.general && (
        <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          {errors.general}
        </div>
      )}
      
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          <FiUser className="inline mr-1" /> Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setErrors(prev => ({ ...prev, username: '' })); }}
          placeholder="Choose a username"
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
            errors.username ? 'border-red-500' : 'border-gray-200 focus:border-theme3'
          }`}
        />
        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
      </div>
      
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          <FiLock className="inline mr-1" /> Password
        </label>
        <div className="relative">
          <input
            type={inputType}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
            placeholder="••••••••"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors pr-12 ${
              errors.password ? 'border-red-500' : 'border-gray-200 focus:border-theme3'
            }`}
          />
          <button
            type="button"
            onClick={toggleViewPassword}
            className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-gray-700"
          >
            {isPasswordHidden ? <FiEye size={20} /> : <FiEyeOff size={20} />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>
      
      <div>
        <label className="block text-gray-700 text-sm font-semibold mb-2">
          <FiLock className="inline mr-1" /> Confirm Password
        </label>
        <input
          type={inputType}
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
          placeholder="••••••••"
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
            errors.confirmPassword ? 'border-red-500' : 'border-gray-200 focus:border-theme3'
          }`}
        />
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
      </div>
      
      <div className="pt-2">
        <button
          onClick={handleAccountSubmit}
          disabled={isLoading}
          className="w-full bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Next'}
        </button>
      </div>
    </div>
  );

  const renderDegreeStep = () => (
    <div className="space-y-5" onKeyDown={(e) => handleKeyDown(e, handleDegreeSubmit)}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Academic Journey</h2>
        <p className="text-gray-600 text-sm">Tell us about your degree program</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Degree Type</label>
          <select
            value={degreeType}
            onChange={(e) => { setDegreeType(e.target.value); setErrors(prev => ({ ...prev, degreeType: '' })); }}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
              errors.degreeType ? 'border-red-500' : 'border-gray-200 focus:border-theme3'
            }`}
          >
            <DegreeTypes />
          </select>
          {errors.degreeType && <p className="text-red-500 text-sm mt-1">{errors.degreeType}</p>}
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Major</label>
          <select
            value={major}
            onChange={(e) => { setMajor(e.target.value); setErrors(prev => ({ ...prev, major: '' })); }}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
              errors.major ? 'border-red-500' : 'border-gray-200 focus:border-theme3'
            }`}
          >
            <MajorOptions />
          </select>
          {errors.major && <p className="text-red-500 text-sm mt-1">{errors.major}</p>}
        </div>
      </div>
      
      <div className="bg-theme2/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FiCalendar className="text-theme3" />
          Academic Timeline
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-600 text-xs font-medium mb-1">Started In</label>
            <select
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-theme3 focus:outline-none transition-colors text-sm"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-600 text-xs font-medium mb-1">Expected Graduation</label>
            <select
              value={expectedGraduationYear}
              onChange={(e) => setExpectedGraduationYear(Number(e.target.value))}
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none transition-colors text-sm ${
                errors.expectedGraduationYear ? 'border-red-500' : 'border-gray-200 focus:border-theme3'
              }`}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {errors.expectedGraduationYear && (
              <p className="text-red-500 text-xs mt-1">{errors.expectedGraduationYear}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="pt-2">
        <button
          onClick={handleDegreeSubmit}
          disabled={isLoading}
          className="w-full bg-theme3 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );

  const renderCoursesStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Add Your Courses</h2>
        <p className="text-gray-600 text-sm">Add courses you&apos;ve taken or are planning to take. You can always add more later!</p>
      </div>
      
      <OnboardingAddCourse />
      
      <div className="flex gap-3 pt-4">
        <button
          onClick={goBack}
          className="flex-1 border-2 border-gray-200 hover:border-theme3 text-gray-700 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <FiArrowLeft /> Back
        </button>
        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? 'Finishing...' : 'Complete Setup'}
          <FiCheck />
        </button>
      </div>
      
      <p className="text-center text-xs text-gray-400">
        You can skip this step and add courses later from your dashboard
      </p>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'account': return renderAccountStep();
      case 'degree': return renderDegreeStep();
      case 'courses': return renderCoursesStep();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-theme2 via-white to-theme2 flex items-center justify-center px-4 py-12">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-theme3/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-theme3/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-yellow-300/20 rounded-full blur-2xl animate-float" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Main card */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/50">
          {/* Header with mascot */}
          <div className="bg-linear-to-r from-theme3 to-theme4 px-8 py-8 text-center relative overflow-hidden">
            {/* Animated background shapes */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center">
              <UniMascot 
                mood={stepInfo.mascotMood} 
                size="lg" 
                message={MASCOT_MESSAGES[currentStep]}
              />
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="px-8 pt-6">
            {renderProgressBar()}
          </div>
          
          {/* Step content */}
          <div className="px-8 pb-8">
            {renderCurrentStep()}
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
