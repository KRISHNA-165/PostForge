import React from 'react';
import { PenTool } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <PenTool className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gradient">BlogHub</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-gray-600 text-sm">
              © 2025 BlogHub. Built with modern web technologies.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Powered by React, Redux Toolkit, and Supabase
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-xs">
            This platform demonstrates modern full-stack development with AI-assisted coding
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;