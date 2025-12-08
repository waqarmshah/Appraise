import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-gray-500 font-bold text-xs">A</div>
            <span className="text-gray-500 font-medium">Appraise &copy; 2024</span>
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600">Privacy</a>
            <a href="#" className="hover:text-gray-600">Terms</a>
            <a href="#" className="hover:text-gray-600">Safety</a>
            <a href="#" className="hover:text-gray-600">Contact</a>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-gray-300 max-w-2xl mx-auto">
          Appraise is an AI assistant. Always verify outputs before submission to GMC/Appraisal bodies. 
          Do not input real patient names. All data processing is automated.
        </p>
      </div>
    </footer>
  );
};