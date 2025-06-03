import React from 'react';
import { 
  Laptop, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Printer, 
  Server, 
  HardDrive,
  Router,
  Headphones,
  Keyboard,
  Mouse,
  Cable,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const assetIconMap: Record<string, React.ElementType> = {
  LAPTOP: Laptop,
  DESKTOP: Monitor,
  MONITOR: Monitor,
  PHONE: Smartphone,
  TABLET: Tablet,
  PRINTER: Printer,
  NETWORK_EQUIPMENT: Router,
  SERVER: Server,
  STORAGE: HardDrive,
  HEADSET: Headphones,
  KEYBOARD: Keyboard,
  MOUSE: Mouse,
  CABLE: Cable,
  OTHER_HARDWARE: Package,
};

const assetColorMap: Record<string, string> = {
  LAPTOP: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
  DESKTOP: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
  MONITOR: 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300',
  PHONE: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300',
  TABLET: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300',
  PRINTER: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300',
  NETWORK_EQUIPMENT: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900 dark:text-cyan-300',
  SERVER: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300',
  STORAGE: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
  HEADSET: 'text-pink-600 bg-pink-100 dark:bg-pink-900 dark:text-pink-300',
  KEYBOARD: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
  MOUSE: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
  CABLE: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
  OTHER_HARDWARE: 'text-slate-600 bg-slate-100 dark:bg-slate-700 dark:text-slate-300',
};

interface AssetIconProps {
  type: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBackground?: boolean;
  assetImage?: string | null;
}

const sizeMap = {
  sm: { container: 'h-8 w-8', icon: 'h-4 w-4' },
  md: { container: 'h-10 w-10', icon: 'h-5 w-5' },
  lg: { container: 'h-12 w-12', icon: 'h-6 w-6' },
  xl: { container: 'h-16 w-16', icon: 'h-8 w-8' },
};

export function AssetIcon({ 
  type, 
  size = 'md', 
  className, 
  showBackground = true, 
  assetImage 
}: AssetIconProps) {
  const IconComponent = assetIconMap[type] || Package;
  const colorClasses = assetColorMap[type] || assetColorMap.OTHER_HARDWARE;
  const sizes = sizeMap[size];

  // If there's a custom image, show it
  if (assetImage) {
    return (
      <div className={cn(
        'relative rounded-lg overflow-hidden flex items-center justify-center',
        sizes.container,
        showBackground ? 'bg-gray-100 dark:bg-gray-700' : '',
        className
      )}>
        <img
          src={assetImage}
          alt={`${type} icon`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to icon if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <IconComponent 
          className={cn(
            'hidden',
            sizes.icon,
            showBackground ? colorClasses.split(' ')[0] : 'text-gray-600 dark:text-gray-400'
          )}
        />
      </div>
    );
  }

  // Default icon display
  return (
    <div className={cn(
      'rounded-lg flex items-center justify-center',
      sizes.container,
      showBackground ? colorClasses : '',
      className
    )}>
      <IconComponent className={cn(
        sizes.icon,
        showBackground ? '' : colorClasses.split(' ')[0]
      )} />
    </div>
  );
}

// Asset type badge component
export function AssetTypeBadge({ type, className }: { type: string; className?: string }) {
  const colorClasses = assetColorMap[type] || assetColorMap.OTHER_HARDWARE;
  
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
      colorClasses,
      className
    )}>
      {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
}

// Default asset images - you could host these on your CDN
export const defaultAssetImages: Record<string, string> = {
  LAPTOP: '/icons/laptop.svg',
  DESKTOP: '/icons/desktop.svg',
  MONITOR: '/icons/monitor.svg',
  PHONE: '/icons/phone.svg',
  TABLET: '/icons/tablet.svg',
  PRINTER: '/icons/printer.svg',
  NETWORK_EQUIPMENT: '/icons/router.svg',
  SERVER: '/icons/server.svg',
  STORAGE: '/icons/storage.svg',
  HEADSET: '/icons/headset.svg',
  KEYBOARD: '/icons/keyboard.svg',
  MOUSE: '/icons/mouse.svg',
  CABLE: '/icons/cable.svg',
  OTHER_HARDWARE: '/icons/package.svg',
}; 