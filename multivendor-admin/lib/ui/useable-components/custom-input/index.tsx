'use client';

import React from 'react';

interface ICustomInputProps {
  className?: string;
  placeholder?: string;
  name: string;
  value?: string | number;
  isLoading?: boolean;
  onChange?: (name: string, value: string | number) => void;
  type?: 'text' | 'number' | 'email' | 'password';
  disabled?: boolean;
}

export default function CustomInput({
  className,
  placeholder,
  name,
  value,
  isLoading = false,
  onChange,
  type = 'text',
  disabled = false,
  ...props
}: ICustomInputProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium text-gray-600">
        {placeholder}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={(e) => onChange?.(name, e.target.value)}
        disabled={disabled}
        className={`h-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-color focus:border-transparent ${className}`}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}

