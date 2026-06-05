import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  type,
  label,
  error,
  ...props
}, ref) => {
  return <div className="w-full" data-id="element-3584">
        {label && <label className="mb-1.5 block text-sm font-medium text-gray-700" data-id="element-3585">
            {label}
          </label>}
        <input type={type} className={cn('flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustopay-purple focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50', error && 'border-red-500 focus-visible:ring-red-500', className)} ref={ref} {...props} data-id="element-3586" />
        {error && <p className="mt-1 text-xs text-red-500" data-id="element-3587">{error}</p>}
      </div>;
});
Input.displayName = 'Input';
export { Input };