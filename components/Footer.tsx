import Image from 'next/image';
import faviconImage from '../app/favicon.png';

export default function Footer() {
  return (
    <footer className="footer bg-linear-to-r from-theme4 to-theme4 border-t border-theme3 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image src={faviconImage} alt="Unigrade Logo" width={32} height={32} className="rounded-lg" />
              <h3 className="text-xl font-bold text-white">Unigrade</h3>
            </div>
            <p className="text-gray-300 text-sm mb-3">
              A comprehensive platform helping students plan their academic and career journey.
            </p>
            <p className="text-gray-400 text-sm">
              Built with modern web technologies to provide an intuitive and powerful experience for students worldwide.
            </p>
          </div>

          {/* Social Links Section */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Get In Touch</h3>
            <p className="text-gray-300 text-sm mb-4">
              Made by <span className="font-semibold">Ofek Avivi</span> as a fullstack web development project.
            </p>
            <div className="flex gap-4">
              <a 
                href="http://github.com/Vexrz2" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 bg-gray-700 hover:bg-theme3 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a 
                href="http://linkedin.com/in/ofekavivi" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 bg-gray-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            &copy; 2025 Unigrade. All rights reserved. Built with Next.js and TypeScript.
          </p>
        </div>
      </div>
    </footer>
  );
};