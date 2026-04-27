import clsx from 'classnames';

export default function Badge({ children, color = 'slate', className }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-rose-100 text-rose-700',
    blue: 'bg-indigo-100 text-indigo-700',
  };
  return <span className={clsx('badge', colors[color] || colors.slate, className)}>{children}</span>;
}




