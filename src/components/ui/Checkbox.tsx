import React, { forwardRef, InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', ...props }, ref) => {
    return (
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            type="checkbox"
            ref={ref}
            className={`
              h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500
              ${error ? 'border-red-300' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="ml-3 text-sm">
            {label && (
              <label
                htmlFor={props.id}
                className={`font-medium ${
                  error ? 'text-red-600' : 'text-gray-700'
                } ${props.disabled ? 'opacity-50' : ''}`}
              >
                {label}
              </label>
            )}
            {description && (
              <p className={`text-gray-500 ${props.disabled ? 'opacity-50' : ''}`}>
                {description}
              </p>
            )}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';