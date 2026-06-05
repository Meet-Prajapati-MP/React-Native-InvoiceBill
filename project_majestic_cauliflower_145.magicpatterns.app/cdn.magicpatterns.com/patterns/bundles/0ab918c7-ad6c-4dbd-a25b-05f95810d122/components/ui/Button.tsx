import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}, ref) => {
  const variants = {
    primary: 'bg-trustopay-purple text-white hover:bg-opacity-90 shadow-sm',
    secondary: 'bg-trustopay-navy text-white hover:bg-opacity-90 shadow-sm',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'hover:bg-gray-100 text-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm'
  };
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-8 text-lg',
    icon: 'h-10 w-10 p-2 flex items-center justify-center'
  };
  return <motion.button ref={ref} whileTap={{
    scale: 0.97
  }} className={cn('inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-trustopay-purple disabled:pointer-events-none disabled:opacity-50', variants[variant], sizes[size], className)} {...props} data-id="element-3582">
        {children}
      </motion.button>;
});
Button.displayName = 'Button';
export { Button };