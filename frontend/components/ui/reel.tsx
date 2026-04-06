'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/routing'; // Импортируем наш локализованный Link

export interface ReelItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  href?: string;  // <-- Добавили ссылку
  title?: string; // <-- Добавили заголовок
}

interface FlowProps extends React.HTMLAttributes<HTMLDivElement> {
  reverse?: boolean;
  repeat?: number;
  pauseOnHover?: boolean;
  applyMask?: boolean;
  duration?: number;
}

const Flow = ({
  children,
  repeat = 9,
  pauseOnHover = false,
  reverse = false,
  applyMask = true,
  duration = 30,
  className,
  ...props
}: FlowProps) => (
  <div
    {...props}
    className={cn(
      'group relative flex h-full w-full overflow-hidden p-1 [--gap:16px] gap-(--gap) flex-row',
      className,
    )}
    style={{ '--duration': `${duration}s` } as React.CSSProperties}
  >
    {Array.from({ length: repeat }).map((_, index) => (
      <div
        key={`item-${index}`}
        className={cn('flex shrink-0 gap-(--gap) animate-canopy-horizontal flex-row', {
          'group-hover:paused': pauseOnHover,
          'direction-reverse': reverse,
        })}
      >
        {children}
      </div>
    ))}
    {applyMask && (
      <div className='pointer-events-none absolute inset-0 z-10 h-full w-full bg-gradient-to-r from-brand-light via-transparent to-brand-light' />
    )}
  </div>
);

const ReelCard = ({ item }: { item: ReelItem }) => {
  const content = (
    // Увеличили в 2 раза: h-96 (было h-48) и w-[576px] (было w-72)
    <Card className='h-96 w-[576px] shrink-0 overflow-hidden p-0 border-0 rounded-3xl relative group/card'>
      <CardContent className='h-full w-full p-0 relative'>
        {item.type === 'image' ? (
          <img src={item.src} alt={item.title || ''} className='h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110' />
        ) : (
          <video
            src={item.src}
            muted
            loop
            playsInline
            autoPlay
            className='h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110'
          />
        )}
        
        {/* Затемнение и Заголовок (увеличили отступы p-8 и размер текста text-3xl) */}
        {item.title && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8 opacity-90 group-hover/card:opacity-100 transition-opacity">
            <h3 className="text-white font-bold text-2xl md:text-3xl line-clamp-2 leading-tight">
              {item.title}
            </h3>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (item.href) {
    return <Link href={item.href} className="block">{content}</Link>;
  }

  return content;
};

const Reel = ({
  items,
  rows = 3,
  repeat = 9,
  pauseOnHover = true,
  applyMask = true,
  duration = 45, // Сделал чуть медленнее по умолчанию для солидности
  direction = 'alternate',
  className,
}: {
  items: ReelItem[];
  rows?: number;
  repeat?: number;
  pauseOnHover?: boolean;
  applyMask?: boolean;
  duration?: number;
  direction?: 'alternate' | 'forward' | 'reverse';
  className?: string;
}) => (
  <div className={cn('w-full overflow-hidden', className)}>
    {Array.from({ length: rows }).map((_, index) => {
      const reverse =
        direction === 'forward' ? false :
        direction === 'reverse' ? true :
        index % 2 !== 0;

      return (
        <Flow
          key={`flow-${index}`}
          reverse={reverse}
          repeat={repeat}
          pauseOnHover={pauseOnHover}
          applyMask={applyMask}
          duration={duration}
        >
          {items.map((item) => (
            <ReelCard key={item.id} item={item} />
          ))}
        </Flow>
      );
    })}
  </div>
);

export { Reel };