import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md' }) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    excellent: 'bg-purple-100 text-purple-800',
    primary: 'bg-primary bg-opacity-10 text-primary font-semibold',
    secondary: 'bg-secondary bg-opacity-10 text-secondary font-semibold',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={`inline-block rounded-full font-semibold transition-all ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  );
}
