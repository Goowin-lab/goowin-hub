import { GOOWIN_LOGO_URL } from '@/lib/constants';
import { cn } from '@/lib/utils';

type GoowinLogoProps = {
  className?: string;
};

export function GoowinLogo({ className }: GoowinLogoProps) {
  return (
    <img
      src={GOOWIN_LOGO_URL}
      alt="Goowin"
      className={cn('h-auto w-[132px] object-contain', className)}
    />
  );
}
