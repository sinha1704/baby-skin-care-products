import React, { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-display font-medium rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:scale-98 shadow-sm shadow-primary-600/10 focus:ring-primary-600',
      secondary: 'bg-primary-100 text-primary-800 hover:bg-primary-200 active:scale-98 focus:ring-primary-500',
      outline: 'border border-primary-500 text-primary-700 hover:bg-primary-50 active:scale-98 focus:ring-primary-500',
      ghost: 'text-primary-700 hover:bg-primary-50 focus:ring-primary-500',
      danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-98 focus:ring-red-500 border border-red-200',
    };

    const sizes = {
      sm: 'px-4 py-1.5 text-xs tracking-wider uppercase',
      md: 'px-6 py-2.5 text-sm tracking-wide',
      lg: 'px-8 py-3.5 text-base tracking-wide',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
