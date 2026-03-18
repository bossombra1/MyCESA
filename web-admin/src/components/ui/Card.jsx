import React from 'react';

export default function Card({ title, value, icon, color = 'primary', subtext }) {
  const colorClasses = {
    primary: 'from-blue-500 to-indigo-600',
    secondary: 'from-purple-500 to-pink-500',
    success: 'from-emerald-400 to-emerald-600',
    warning: 'from-orange-400 to-red-500',
  };

  const shadowClasses = {
    primary: 'shadow-indigo-200/50',
    secondary: 'shadow-pink-200/50',
    success: 'shadow-emerald-200/50',
    warning: 'shadow-orange-200/50',
  };

  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 border border-gray-50/50 ${shadowClasses[color]} hover:shadow-2xl z-10 group`}>
      {/* Decorative background gradient */}
      <div className={`absolute top-0 right-0 -m-6 w-32 h-32 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-300 -z-10`}></div>
      
      <div className="flex justify-between items-start z-10">
        <div className="z-10">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-4xl font-black text-gray-800 tracking-tight">{value}</p>
          {subtext && <p className="text-xs font-medium text-gray-400 mt-2">{subtext}</p>}
        </div>
        {icon && (
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg bg-gradient-to-br ${colorClasses[color]} transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 z-10`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
