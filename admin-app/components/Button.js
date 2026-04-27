"use client";

import clsx from 'classnames';

export default function Button({ children, variant = 'primary', className, ...props }) {
  return (
    <button
      className={clsx(
        'btn',
        variant === 'primary' && 'btn-primary',
        variant === 'ghost' && 'btn-ghost',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}




