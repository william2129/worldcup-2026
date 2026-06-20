// 国旗组件,使用 flagcdn.com 提供的 SVG/PNG。
// 支持 ISO 3166-1 alpha-2 (大多数国家) 及 gb-eng/gb-sct/gb-wls/gb-nir 子分类。
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FlagProps {
  code: string;
  size?: number;
  rounded?: boolean;
  className?: string;
  alt?: string;
}

const SIZE_TO_SRC = (code: string, size: number) => {
  const c = code.toLowerCase();
  // flagcdn 提供 w20/w40/w80/w160/w320 等 webp
  const bucket = size <= 24 ? 'w40' : size <= 48 ? 'w80' : size <= 96 ? 'w160' : 'w320';
  return `https://flagcdn.com/${bucket}/${c}.png`;
};

export function Flag({ code, size = 28, rounded = true, className, alt }: FlagProps) {
  return (
    <Image
      src={SIZE_TO_SRC(code, size)}
      width={size}
      height={Math.round(size * 0.66)}
      alt={alt ?? `${code} 国旗`}
      className={cn(
        'inline-block object-cover ring-1 ring-black/10',
        rounded ? 'rounded-[3px]' : '',
        className,
      )}
      unoptimized
    />
  );
}
