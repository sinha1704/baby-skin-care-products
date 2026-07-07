import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, type = 'text', id, ...props }, ref) => {
    return (
      <div className="w-full mb-4">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-display font-medium text-primary-800 mb-1.5 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          type={type}
          className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm transition-all duration-300 outline-none
            focus:border-primary-600 focus:ring-2 focus:ring-primary-100 placeholder:text-gray-400
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-50' : 'border-primary-200'}
            ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500 font-sans">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
