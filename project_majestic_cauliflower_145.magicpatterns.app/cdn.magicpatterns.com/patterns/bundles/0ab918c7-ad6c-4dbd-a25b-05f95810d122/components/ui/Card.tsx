import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';
const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({
  className,
  ...props
}, ref) => <div ref={ref} className={cn('rounded-xl border border-gray-100 bg-white text-trustopay-navy shadow-sm', className)} {...props} data-id="element-3583" />);
Card.displayName = 'Card';
export { Card };