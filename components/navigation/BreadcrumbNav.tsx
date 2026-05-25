import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

export default function BreadcrumbNav({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-gray-300">›</span>}
          {c.href ? (
            <Link href={c.href} className="hover:text-[#1565C0] transition-colors font-medium">
              {c.label}
            </Link>
          ) : (
            <span className="text-gray-800 font-semibold">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
