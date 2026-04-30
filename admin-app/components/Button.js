"use client";

import clsx from 'classnames';

export default function Button({ children, variant = 'primary', size, className, ...props }) {
  return (
    <button
      className={clsx(
        'btn',
        variant === 'primary'   && 'btn-primary',
        variant === 'secondary' && 'btn-secondary',
        variant === 'ghost'     && 'btn-ghost',
        variant === 'danger'    && 'btn-danger',
        size === 'sm'           && '!px-3 !py-1.5 !text-xs',
        size === 'lg'           && '!px-5 !py-3 !text-base',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
