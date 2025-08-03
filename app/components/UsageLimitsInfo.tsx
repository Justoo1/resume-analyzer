import React from 'react';
import { Clock, Star, Zap, Shield, Users } from 'lucide-react';

const UsageLimitsInfo: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Clock className="w-8 h-8 text-orange-600" />
          <h2 className="text-3xl font-bold text-gray-900">Usage Limits & Fair Usage</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We maintain usage limits to ensure reliable service for all users while managing the computational costs of AI analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="text-center p-6 bg-blue-50 rounded-xl">
          <Star className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-blue-800 mb-2">Free Tier</h3>
          <p className="text-blue-700 text-sm">
            5 CV analyses per day
          </p>
        </div>
        
        <div className="text-center p-6 bg-purple-50 rounded-xl">
          <Zap className="w-8 h-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-purple-800 mb-2">Pro Users</h3>
          <p className="text-purple-700 text-sm">
            50 analyses per day
          </p>
        </div>
        
        <div className="text-center p-6 bg-green-50 rounded-xl">
          <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-green-800 mb-2">Enterprise</h3>
          <p className="text-green-700 text-sm">
            Unlimited analyses
          </p>
        </div>
        
        <div className="text-center p-6 bg-orange-50 rounded-xl">
          <Users className="w-8 h-8 text-orange-600 mx-auto mb-3" />
          <h3 className="font-semibold text-orange-800 mb-2">Fair Usage</h3>
          <p className="text-orange-700 text-sm">
            Quality over quantity
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4">💡 What you can still do:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700 text-sm">Download your existing analyses in PDF, DOCX, or TXT format</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700 text-sm">Review and copy your restructured CV content</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700 text-sm">Access all your previous feedback and recommendations</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700 text-sm">Manage your stored files and data</p>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">
          Need more analyses? Your limits reset daily at midnight UTC.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Upgrade to Pro
          </button>
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsageLimitsInfo;