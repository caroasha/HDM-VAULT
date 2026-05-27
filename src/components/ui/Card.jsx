import { clsx } from 'clsx';

export default function Card({ children, className, hover, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm',
        hover && 'hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={clsx('px-6 py-4 border-b border-gray-200 dark:border-gray-700', className)}>{children}</div>;
}

export function CardBody({ children, className }) {
  return <div className={clsx('px-6 py-4', className)}>{children}</div>;
}