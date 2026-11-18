/**
 * Ranking fixtures.
 *
 * All ranking data shown on the site comes from this module. The data is
 * generated deterministically from a fixed seed so every render (SSR and
 * client) matches. A later milestone replaces `getRankings()` with a real
 * data source (Netlify Database fed by the game server).
 */

export const SITE = {
  name: 'かろPVP',
  romaji: 'KaroPvP',
  serverIp: 'play.karon.jp',
  discordUrl: 'https://discord.gg/karoasu-bu-an-ding-1142835701977731102',
} as const

export type ModeId =
  | 'sword'
  | 'mace'
  | 'netherite'
  | 'pot'
  | 'crystal'
  | 'spear'

export type Mode = { id: ModeId; name: string; jp: string }

export const MODES: Mode[] = [
  { id: 'sword', name: 'Sword', jp: '剣' },
  { id: 'mace', name: 'Mace', jp: 'メイス' },
  { id: 'netherite', name: 'Neth OP', jp: 'ネザライト' },
  { id: 'pot', name: 'Pot', jp: 'ポーション' },
  { id: 'crystal', name: 'Crystal', jp: 'クリスタル' },
  { id: 'spear', name: 'Spear', jp: 'スピア' },
]

export type Category = 'overall' | 'ffa' | ModeId

export const TIER_CODES = [
  'HT1',
  'LT1',
  'HT2',
  'LT2',
  'HT3',
  'LT3',
  'HT4',
  'LT4',
  'HT5',
  'LT5',
] as const
export type TierCode = (typeof TIER_CODES)[number]

export const TIER_POINTS: Record<TierCode, number> = {
  HT1: 60,
  LT1: 45,
  HT2: 30,
  LT2: 20,
  HT3: 10,
  LT3: 6,
  HT4: 4,
  LT4: 3,
  HT5: 2,
  LT5: 1,
}

export type ModeResult = {
  tier: TierCode
  wins: number
  losses: number
}

export type Player = {
  name: string
  region: 'JP' | 'KR' | 'TW' | 'AS'
  points: number
  matches: number
  tiers: Partial<Record<ModeId, ModeResult>>
  ffa: { kills: number; bestStreak: number }
}

export function tierLevel(tier: TierCode): number {
  return Number(tier.slice(2))
}

export function isHigh(tier: TierCode): boolean {
  return tier.startsWith('HT')
}

export function rankTitle(points: number): string {
  if (points >= 250) return 'Combat Grandmaster'
  if (points >= 150) return 'Combat Master'
  if (points >= 80) return 'Combat Ace'
  if (points >= 40) return 'Combat Specialist'
  if (points >= 15) return 'Combat Cadet'
  return 'Rookie'
}

/** FFA tier is derived from total kills. */
export function ffaTier(kills: number): TierCode {
  const steps: [number, TierCode][] = [
    [4000, 'HT1'],
    [3000, 'LT1'],
    [2200, 'HT2'],
    [1600, 'LT2'],
    [1100, 'HT3'],
    [700, 'LT3'],
    [400, 'HT4'],
    [200, 'LT4'],
    [80, 'HT5'],
  ]
  return steps.find(([min]) => kills >= min)?.[1] ?? 'LT5'
}

const NAMES = [
  'SwettyMC',
  'eagz2035',
  'menmen110',
  'Hruka657',
  'yvvulo',
  'Yonegon7',
  'Tempest5656',
  'levelJP5087',
  'Bid Side7778',
]

const REGIONS: Player['region'][] = ['JP', 'JP', 'JP', 'JP', 'KR', 'TW', 'AS']

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildPlayers(const CUSTOM_TIERS: Partial<Record<string, Partial<Record<ModeId, TierCode>>>> = {
  SwettyMC: {
    sword: 'HT1',
    netherite: 'LT2',
    pot: 'HT3',
    crystal: 'HT3',
    spear: 'LT3',
  },

  eagz2035: {
    sword: 'LT2',
    netherite: 'LT1',
    pot: 'LT1',
    crystal: 'HT1',
  },
    
}): Player[] {
  const rand = mulberry32(20261118)
  const players = NAMES.map((name, index) => {
    // Earlier names skew stronger so the leaderboard has a clear top.
    const skill = Math.max(0, 1 - index / NAMES.length + (rand() - 0.5) * 0.35)
    const tiers: Player['tiers'] = {}
    let matches = 0
    for (const mode of MODES) {
      if (rand() > 0.35 + skill * 0.6) continue
      const roll = Math.min(0.999, Math.max(0, (1 - skill) * 0.85 + rand() * 0.45))
　　　　const tier = CUSTOM_TIERS[name]?.[mode.id]
        ?? TIER_CODES[Math.floor(roll * TIER_CODES.length)]
      const wins = Math.round(8 + rand() * 120 * (skill + 0.2))
      const losses = Math.round(1 + rand() * 30 * (1.2 - skill))
      matches += wins + losses
      tiers[mode.id] = { tier, wins, losses }
    }
    const points = Object.values(tiers).reduce(
      (sum, r) => sum + TIER_POINTS[r.tier],
      0,
    )
    const kills = Math.round(30 + rand() * 4600 * (skill * skill + 0.05))
    return {
      name,
      region: REGIONS[Math.floor(rand() * REGIONS.length)],
      points,
      matches,
      tiers,
      ffa: {
        kills,
        bestStreak: Math.max(3, Math.round(kills / (40 + rand() * 120))),
      },
    } satisfies Player
  })
  return players
    .filter((p) => p.points > 0)
    .sort((a, b) => b.points - a.points || b.matches - a.matches)
}

const PLAYERS = buildPlayers()

export function getRankings(): Player[] {
  return PLAYERS
}

export function getPlayer(name: string): Player | undefined {
  return PLAYERS.find((p) => p.name === name)
}

export function getMode(id: string): Mode | undefined {
  return MODES.find((m) => m.id === id)
}

export const CATEGORY_IDS: Category[] = [
  'overall',
  'ffa',
  ...MODES.map((m) => m.id),
]

export function isCategory(value: string): value is Category {
  return (CATEGORY_IDS as string[]).includes(value)
}
