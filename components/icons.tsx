import {
  Axe,
  Crosshair,
  FlaskConical,
  Gem,
  Hammer,
  Heart,
  Pickaxe,
  Shield,
  Skull,
  Sword,
  Trophy,
  type LucideIcon,
} from 'lucide-react'

import type { Category } from '@/data/rankings'

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  overall: Trophy,
  ffa: Skull,
  sword: Sword,
  axe: Axe,
  mace: Hammer,
  netherite: Shield,
  uhc: Heart,
  pot: FlaskConical,
  smp: Pickaxe,
  crystal: Gem,
  spear: Crosshair,
}

export function CategoryIcon({
  category,
  className,
}: {
  category: Category
  className?: string
}) {
  const Icon = CATEGORY_ICONS[category]
  return <Icon className={className} aria-hidden="true" strokeWidth={2.2} />
}

/** Pixel-art logo mark: a stylised ingot made of blocks. */
export function LogoMark({ size = 36 }: { size?: number }) {
  const px = [
    '..1111..',
    '.122221.',
    '12333321',
    '12333321',
    '12222221',
    '.111111.',
  ]
  const colors: Record<string, string> = {
    '1': '#3b4a5e',
    '2': '#9fb2c8',
    '3': '#e8eef6',
  }
  return (
    <svg
      viewBox="0 0 8 6"
      width={size}
      height={(size * 6) / 8}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {px.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === '.' ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1.02}
              height={1.02}
              fill={colors[c]}
            />
          ),
        ),
      )}
      <rect x={2} y={2} width={1} height={1} fill="#ffb927" />
    </svg>
  )
}
