import Image from 'next/image';
import { Menu, CopyMinus } from 'lucide-react';

interface Props {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function SidebarHeader({ isCollapsed, onToggle }: Props) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        {!isCollapsed && (
          <Image
            src="/assets/main-logo.svg"
            alt="logo"
            width={120}
            height={30}
            className="mx-[10px]"
          />
        )}

        <button
          onClick={onToggle}
          className="p-1 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {isCollapsed ? <Menu size={20} /> : <CopyMinus size={20} />}
        </button>
      </div>
    </div>
  );
}