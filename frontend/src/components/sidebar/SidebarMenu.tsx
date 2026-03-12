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
    <nav className="flex-1 overflow-hidden p-4 space-y-6">
      <div>
        {!isCollapsed && (
          <h3 className="text-sm text-black uppercase tracking-wider mb-3">
            MAIN MENU
          </h3>
        )}

        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`w-full flex items-center truncate px-3 py-4 rounded-lg transition-all duration-200 text-sm group ${
                  item.active
                    ? 'bg-primary-600 text-white font-bold shadow-lg shadow-primary-100'
                    : 'text-gray-700 hover:bg-gray-200 hover:text-black'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={30}
                  height={30}
                  className={`w-[30px] h-[30px] object-contain ${
                    !isCollapsed && 'mr-3'
                  } ${item.active ? 'brightness-0 invert' : ''}`}
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