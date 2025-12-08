import React from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  currentView: string;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout, onNavigate, currentView }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => onNavigate('landing')}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2 text-white font-bold text-xl group-hover:scale-105 transition-transform shadow-blue-200 shadow-lg">
              A
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Appraise</span>
            {user?.plan === 'plus' && (
              <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full uppercase tracking-wider shadow-sm">
                Plus
              </span>
            )}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {!user ? (
              <>
                <button onClick={() => window.location.hash = '#how-it-works'} className="text-gray-500 hover:text-blue-600 font-medium transition-colors">How it works</button>
                <button onClick={() => window.location.hash = '#features'} className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Features</button>
                <button onClick={() => window.location.hash = '#pricing'} className="text-gray-500 hover:text-blue-600 font-medium transition-colors">Pricing</button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => onNavigate('console')}
                  className={`${currentView === 'console' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-900'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  Console
                </button>
                <button 
                  onClick={() => onNavigate('notes')}
                  className={`${currentView === 'notes' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-900'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  Notes
                </button>
                <button 
                  onClick={() => onNavigate('exports')}
                  className={`${currentView === 'exports' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-900'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
                >
                  Exports
                </button>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                 <div className="hidden sm:block text-right">
                    <p className="text-xs text-gray-400 font-medium">Logged in as</p>
                    <p className="text-sm font-semibold text-gray-700 leading-none">{user.name}</p>
                 </div>
                 <div className="relative group">
                    <img 
                      src={user.avatar} 
                      alt="Profile" 
                      className="h-9 w-9 rounded-full ring-2 ring-white shadow-md cursor-pointer hover:ring-blue-100 transition-all"
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl py-1 hidden group-hover:block border border-gray-100 animate-slide-up">
                      <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Log out</button>
                    </div>
                 </div>
              </div>
            ) : (
              <>
                <button 
                  onClick={onLogin}
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm hidden sm:block"
                >
                  Log in
                </button>
                <button 
                  onClick={onLogin}
                  className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-gray-200 transition-all hover:scale-105 active:scale-95"
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