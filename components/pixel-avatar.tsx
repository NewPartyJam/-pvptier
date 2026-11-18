/**
 * Deterministic 8×8 pixel-art head generated from the player name.
 * Stands in for Minecraft skin renders until real skins are wired up.
 */

const SKINS = ['#f2c7a0', '#e0ac7e', '#c68a5c', '#8d5a3b', '#f6d5b8', '#b97a56']
const HAIR = ['#2a1d14', '#4b3020', '#111318', '#7a5230', '#d9b45a', '#c4c8d0', '#6b2a2a', '#2f3e66']
const EYES = ['#3d6fd1', '#2d8a52', '#5a3b22', '#7b3fb8', '#1d1d1d', '#c0392b']
const ACCENT = ['#ffb927', '#59c3ff', '#ff6b8b', '#7ee081', '#b38cff', '#ffffff']

function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pick<T>(list: T[], n: number): T {
  return list[n % list.length]
}

export function PixelAvatar({
  name,
  size = 40,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const h = hash(name)
  const skin = pick(SKINS, h)
  const hair = pick(HAIR, h >>> 3)
  const eye = pick(EYES, h >>> 6)
  const accent = pick(ACCENT, h >>> 9)
  const fringe = (h >>> 12) % 4
  const hasBand = ((h >>> 15) & 3) === 0
  const hasBeard = ((h >>> 17) & 7) === 0

  const cells: { x: number; y: number; c: string }[] = []
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      let c = skin
      if (y < 2) c = hair
      if (y === 2 && (x === 0 || x === 7 || (fringe > 0 && (x + fringe) % 3 === 0)))
        c = hair
      if (y === 3 && (x === 0 || x === 7) && fringe > 1) c = hair
      if (hasBand && y === 1) c = accent
      if (y === 4 && (x === 1 || x === 5)) c = '#ffffff'
      if (y === 4 && (x === 2 || x === 6)) c = eye
      if (y === 6 && x >= 3 && x <= 4) c = '#8a4f3a'
      if (hasBeard && y >= 6 && x > 0 && x < 7 && !(y === 6 && x >= 3 && x <= 4))
        c = hair
      cells.push({ x, y, c })
    }
  }

  return (
    <svg
      viewBox="0 0 8 8"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
    >
      {cells.map(({ x, y, c }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={c} />
      ))}
      <rect x={0} y={7} width={8} height={1} fill="#000" opacity={0.12} />
    </svg>
  )
}
