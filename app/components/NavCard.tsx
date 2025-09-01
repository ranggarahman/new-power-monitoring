import Link from 'next/link';
import type { ReactNode } from 'react';

interface NavCardProps {
  href: string;
  icon: ReactNode;
  title: string;
}

const NavCard = ({ href, icon, title }: NavCardProps) => {
  return (
    <Link
      href={href}
      className="group flex w-64 flex-col items-center justify-center rounded-xl border border-transparent bg-white p-6 shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:border-blue-500 hover:shadow-xl"
    >
      <span className="text-5xl">{icon}</span>
      <span className="mt-4 text-center text-xl font-semibold text-gray-700 transition-colors group-hover:text-blue-600">
        {title}
      </span>
    </Link>
  );
};

export default NavCard;