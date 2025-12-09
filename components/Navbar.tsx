import React from 'react';
import { User } from '../types';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout, onNavigate, currentView }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-[#0f1014]/90 backdrop-blur-md border-b border-gray-100 dark:border-white/5 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => onNavigate('landing')}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2 text-white font-bold text-xl group-hover:scale-105 transition-transform shadow-blue-200 dark:shadow-none shadow-lg">
              A
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Appraise</span>
            {user?.plan === 'appraise_plus' && (
              <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                Plus
              </span>
            )}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {!user ? (
              <>
                <button onClick={() => window.location.hash = '#how-it-works'} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">How it works</button>
                <button onClick={() => window.location.hash = '#features'} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Features</button>
                <button onClick={() => window.location.hash = '#pricing'} className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Pricing</button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('console')}
                  className={`${currentView === 'console' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  Console
                </button>
                <button
                  onClick={() => onNavigate('notes')}
                  className={`${currentView === 'notes' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  Notes
                </button>
                <button
                  onClick={() => onNavigate('exports')}
                  className={`${currentView === 'exports' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  Exports
                </button>
                <button
                  onClick={() => onNavigate('capabilities')}
                  className={`${currentView === 'capabilities' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  Capabilities
                </button>
              </>
            )}
          </div>

          {/* Auth Buttons + Theme Toggle */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-gray-400 font-medium">Logged in as</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-none">{user.name}</p>
                </div>
                <div className="relative group">
                  <img
                    src={user.photoURL || 'https://ui-avatars.com/api/?name=' + user.name}
                    alt="Profile"
                    className="h-9 w-9 rounded-full ring-2 ring-white dark:ring-gray-700 shadow-md cursor-pointer hover:ring-blue-100 dark:hover:ring-blue-900 transition-all"
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#303030] rounded-xl shadow-xl py-1 hidden group-hover:block border border-gray-100 dark:border-white/10 animate-slide-up">
                    <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Log out</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm hidden sm:block"
                >
                  Log in
                </button>
                <button
                  onClick={onLogin}
                  className="bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-gray-900 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-gray-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};