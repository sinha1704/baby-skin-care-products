import React, { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, options, error, id, ...props }, ref) => {
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
        <div className="relative">
          <select
            id={id}
            ref={ref}
            className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm transition-all duration-300 outline-none appearance-none
              focus:border-primary-600 focus:ring-2 focus:ring-primary-100 cursor-pointer
              ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-50' : 'border-primary-200'}
              ${className}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500 font-sans">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
