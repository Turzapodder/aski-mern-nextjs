import Image from 'next/image';
import Link from 'next/link';

interface Item {
  name: string;
  icon: string;
  href: string;
  active?: boolean;
}

interface Props {
  items: Item[];
  isCollapsed: boolean;
}

export default function SidebarMenu({ items, isCollapsed }: Props) {
  return (
    <nav className={`flex-1 overflow-hidden space-y-6 ${isCollapsed ? 'p-2' : 'p-4'}`}>
      <div>
        {!isCollapsed && (
          <h3 className="text-sm text-black uppercase tracking-wider mb-3">MAIN MENU</h3>
        )}

        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`w-full flex items-center rounded-lg transition-all duration-200 text-sm group ${
                  isCollapsed ? 'justify-center p-3' : 'px-3 py-4 truncate'
                } ${
                  item.active
                    ? 'bg-primary-600 text-white font-bold shadow-lg shadow-primary-100'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-black'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={24}
                  height={24}
                  className={`w-6 h-6 object-contain shrink-0 ${
                    !isCollapsed ? 'mr-3' : ''
                  }`}
                />

                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
