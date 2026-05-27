import { clsx } from 'clsx';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({ label, error, type = 'text', className, ...props }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          className={clsx(
            'w-full px-4 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors',
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
            isPassword && 'pr-10',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}