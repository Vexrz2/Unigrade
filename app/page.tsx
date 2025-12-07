"use client";

import Link from "next/link";
import { FaGraduationCap, FaChartLine, FaBriefcase, FaCalendarAlt, FaCheckCircle, FaArrowRight } from "react-icons/fa";

const features = [
  {
    icon: <FaChartLine className="w-8 h-8" />,
    title: "GPA Tracking",
    description: "Monitor your academic progress with real-time GPA calculations and what-if scenarios to plan your path to success.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: <FaCalendarAlt className="w-8 h-8" />,
    title: "Study Planner",
    description: "Organize your study schedule, track exam dates, and never miss an important deadline with smart reminders.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: <FaBriefcase className="w-8 h-8" />,
    title: "Career Planning",
    description: "Discover internships and job opportunities matched to your skills with personalized career guidance.",
    color: "from-orange-500 to-red-500"
  }
];

const steps = [
  {
    number: "1",
    title: "Create Your Profile",
    description: "Sign up and tell us about your major, courses, and career goals."
  },
  {
    number: "2",
    title: "Add Your Courses",
    description: "Input your courses, grades, and credit hours to track your academic progress."
  },
  {
    number: "3",
    title: "Plan & Succeed",
    description: "Use our tools to plan your studies, simulate your GPA, and explore career paths."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-theme2 to-theme1">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-theme3/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-theme4/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 text-gray-800 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
            <FaGraduationCap className="w-4 h-4" />
            <span>The #1 Platform for Student Success</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Your Academic Journey,{" "}
            <span className="bg-linear-to-r from-theme3 to-theme4 bg-clip-text text-transparent">
              Simplified
            </span>
          </h1>
          
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-10">
            Track your grades, plan your studies, and discover career opportunities—all in one powerful platform designed for ambitious students.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center gap-2 bg-theme3 hover:bg-theme4 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-theme3/30"
            >
              Get Started Free
              <FaArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg border border-gray-200 hover:border-theme3 hover:shadow-lg transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed to help you achieve your academic and career goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-theme3/30 hover:-translate-y-2"
              >
                <div className={`inline-flex p-4 rounded-xl bg-linear-to-r ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600">
              Setting up your account takes less than 5 minutes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-linear-to-r from-theme3 to-theme4"></div>
                )}
                
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative z-10">
                  <div className="w-12 h-12 bg-linear-to-r from-theme3 to-theme4 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-linear-to-r from-theme3 to-theme4 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to Transform Your Academic Life?
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Start tracking your grades, planning your studies, and discovering career opportunities today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center gap-2 bg-white text-theme3 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105"
                >
                  Start Your Journey
                  <FaArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-white/70 text-sm mt-6 flex items-center justify-center gap-2">
                <FaCheckCircle className="w-4 h-4" />
                Free forever • No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}