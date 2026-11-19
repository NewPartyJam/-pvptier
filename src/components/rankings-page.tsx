import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ChevronsDown,
  ChevronsUp,
  Code,
  Copy,
  Gamepad2,
  House,
  Info,
  Medal,
  Search,
  Server,
  Trophy,
} from 'lucide-react'
import { toast } from 'sonner'

import { CategoryIcon, LogoMark } from '@/components/icons'
import { PixelAvatar } from '@/components/pixel-avatar'
import {
  MODES,
  SITE,
  TIER_POINTS,
  ffaTier,
  getMode,
  getRankings,
  isHigh,
  rankTitle,
  tierLevel,
  type Category,
  type ModeId,
  type Player,
} from '@/data/rankings'

const PAGE_SIZE = 15

export function RankingsPage({ category }: { category: Category }) {
  const [query, setQuery] = useState('')
  const [profile, setProfile] = useState<Player | null>(null)
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <div className="hg">
      <a className="hg-skip" href="#rankings">
        ランキングへスキップ
      </a>
      <Masthead query={query} onQuery={setQuery} />
      <main id="rankings" className="hg-wrap hg-main">
        <ModeTabs current={category} />
        <section className="hg-board" aria-labelledby="mode-title">
          <BoardTitle category={category} onInfo={() => setInfoOpen(true)} />
          {category === 'overall' && (
            <OverallList query={query} onSelect={setProfile} />
          )}
          {category === 'ffa' && <FfaList query={query} />}
          {category !== 'overall' && category !== 'ffa' && (
            <TierGrid mode={category} query={query} onSelect={setProfile} />
          )}
        </section>
      </main>
      <SiteFooter />
      <Modal open={infoOpen} onClose={() => setInfoOpen(false)} labelledBy="info-title">
        <h2 id="info-title">ランキングについて</h2>
        <p>
          総合ランキングは、総合ティアの高い順（同ティアはティアポイントの合計順）に並びます。各モードではHT1からLT5までのティアでプレイヤーを掲載しています。
        </p>
        <p>
          FFAは総侵略数及びFFAティアの上位10名を表示します。FFAは戦争時においての雑魚殲滅力、多数対多数、一対多数などの総合的な戦争経験能力を指します。FFAティアは1〜10の数値で指定します（1 = LT5、9 = LT1、10 = HT1）。
        </p>
        <ul className="hg-points">
          {Object.entries(TIER_POINTS).map(([tier, pts]) => (
            <li key={tier} className={`hg-tierchip t${tierLevel(tier as never)}`}>
              <strong>{tier}</strong>
              <span>{pts}pt</span>
            </li>
          ))}
        </ul>
        <p className="hg-muted-note">現在は手動で更新している暫定データです。</p>
      </Modal>
      <Modal open={!!profile} onClose={() => setProfile(null)} labelledBy="profile-name">
        {profile && <Profile player={profile} />}
      </Modal>
    </div>
  )
}

/* ───────────────────────── Header ───────────────────────── */

function Masthead({
  query,
  onQuery,
}: {
  query: string
  onQuery: (q: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.key === '/' && !/INPUT|TEXTAREA/.test(target.tagName)) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="hg-wrap hg-masthead">
      <Link to="/" className="hg-brand" aria-label={`${SITE.romaji} ランキング`}>
        <LogoMark size={34} />
        <span className="hg-brand-text">
          <strong>{SITE.name}</strong>
          <small>{SITE.romaji}</small>
        </span>
      </Link>
      <nav className="hg-topnav" aria-label="メインナビゲーション">
        <Link to="/">
          <House /> ホーム
        </Link>
        <Link to="/" aria-current="page">
          <Trophy /> ランキング
        </Link>
        <a href={SITE.discordUrl} target="_blank" rel="noreferrer">
          <Gamepad2 /> Discord
        </a>
        <a href="#server-ip">
          <Server /> サーバーIP
        </a>
        <a
          href="#api"
          onClick={(e) => {
            e.preventDefault()
            toast('公開APIは近日公開予定です')
          }}
        >
          <Code /> API
        </a>
      </nav>
      <label className="hg-search">
        <Search />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          aria-label="プレイヤー検索"
          placeholder="プレイヤーを検索…"
          autoComplete="off"
        />
        <kbd aria-hidden="true">/</kbd>
      </label>
    </header>
  )
}

/* ───────────────────────── Tabs ───────────────────────── */

const TAB_LIST: { id: Category; label: string }[] = [
  { id: 'overall', label: 'Overall' },
  { id: 'ffa', label: 'FFA' },
  ...MODES.map((m) => ({ id: m.id as Category, label: m.name })),
]

function ModeTabs({ current }: { current: Category }) {
  return (
    <nav className="hg-modes" aria-label="ランキングカテゴリー">
      {TAB_LIST.map((tab) => {
        const active = tab.id === current
        const content = (
          <>
            <span className="hg-mode-item">
              <CategoryIcon category={tab.id} />
            </span>
            <strong className="hg-mode-name">{tab.label}</strong>
          </>
        )
        return tab.id === 'overall' ? (
          <Link
            key={tab.id}
            to="/"
            className="hg-mode"
            data-mode={tab.id}
            aria-current={active ? 'page' : undefined}
          >
            {content}
          </Link>
        ) : (
          <Link
            key={tab.id}
            to="/rankings/$mode"
            params={{ mode: tab.id }}
            className="hg-mode"
            data-mode={tab.id}
            aria-current={active ? 'page' : undefined}
          >
            {content}
          </Link>
        )
      })}
    </nav>
  )
}

/* ───────────────────────── Board title ───────────────────────── */

function categoryTitle(category: Category): string {
  if (category === 'overall') return '総合 Minecraft PvP ランキング'
  if (category === 'ffa') return 'FFA ランキング'
  const mode = getMode(category)
  return `${mode?.name ?? category} ティアリスト`
}

function categoryCount(category: Category): string {
  const players = getRankings()
  if (category === 'overall') return `${players.length}人のランク入りプレイヤー`
  if (category === 'ffa')
    return `総侵略数・FFAティア上位${Math.min(10, players.length)}名`
  const n = players.filter((p) => p.tiers[category]).length
  return `${n}人がティア認定済み`
}

function BoardTitle({
  category,
  onInfo,
}: {
  category: Category
  onInfo: () => void
}) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SITE.serverIp)
      toast.success('サーバーIPをコピーしました', { description: SITE.serverIp })
    } catch {
      toast(SITE.serverIp)
    }
  }
  return (
    <div className="hg-board-title">
      <div className="hg-heading">
        <h1 id="mode-title">{categoryTitle(category)}</h1>
        <p className="hg-count" aria-live="polite">
          {categoryCount(category)}
        </p>
      </div>
      <div className="hg-board-tools">
        <button className="hg-info-button" type="button" onClick={onInfo}>
          <Info /> 情報
        </button>
        <div className="hg-server-box" id="server-ip">
          <span className="hg-server-trophy" aria-hidden="true">
            <Trophy />
          </span>
          <div className="hg-server-copy">
            <span className="hg-server-label">Server IP</span>
            <button
              className="hg-server"
              type="button"
              onClick={copy}
              aria-label="サーバーアドレスをコピー"
            >
              <span>{SITE.serverIp}</span>
              <Copy />
            </button>
          </div>
          <a
            className="hg-discord"
            href={SITE.discordUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Discordに参加"
          >
            <Gamepad2 />
          </a>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────── Overall ───────────────────────── */

function matches(player: Player, query: string) {
  return player.name.toLowerCase().includes(query.trim().toLowerCase())
}

function OverallList({
  query,
  onSelect,
}: {
  query: string
  onSelect: (p: Player) => void
}) {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const ranked = useMemo(
    () => getRankings().map((player, i) => ({ player, rank: i + 1 })),
    [],
  )
  const filtered = ranked.filter(({ player }) => matches(player, query))
  const visible = query ? filtered : filtered.slice(0, limit)

  if (filtered.length === 0) return <Notice query={query} />

  return (
    <div className="hg-results-enter">
      <div className="hg-column-labels" aria-hidden="true">
        <span>#</span>
        <span>プレイヤー</span>
        <span>ティア</span>
      </div>
      {visible.map(({ player, rank }) => (
        <button
          key={player.name}
          type="button"
          className="hg-rank-row"
          onClick={() => onSelect(player)}
        >
          <Podium rank={rank} name={player.name} />
          <span className="hg-player">
            <span className="hg-player-name">{player.name}</span>
            <span className="hg-player-note">
              <Medal />
              <span>
                総合 {player.overall} · {rankTitle(player.points)}（{player.points} pt）
              </span>
            </span>
          </span>
          <span className="hg-chips">
            {MODES.map((mode) => {
              const r = player.tiers[mode.id]
              if (!r) return null
              return (
                <span
                  key={mode.id}
                  className={`hg-chip t${tierLevel(r.tier)}`}
                  title={`${mode.name}: ${r.tier}`}
                >
                  <span className="hg-chip-icon">
                    <CategoryIcon category={mode.id} />
                  </span>
                  <span className="hg-chip-label">{r.tier}</span>
                </span>
              )
            })}
          </span>
        </button>
      ))}
      {!query && limit < filtered.length && (
        <button
          type="button"
          className="hg-more"
          onClick={() => setLimit((l) => l + PAGE_SIZE)}
        >
          さらに表示
        </button>
      )}
    </div>
  )
}

function Podium({ rank, name }: { rank: number; name: string }) {
  const place = rank === 1 ? 'first' : rank === 2 ? 'second' : rank === 3 ? 'third' : ''
  return (
    <span className={`hg-podium ${place}`}>
      <span className="hg-podium-ribbon" aria-hidden="true" />
      <strong>{rank}.</strong>
      <PixelAvatar name={name} size={44} className="hg-avatar" />
    </span>
  )
}

function Notice({ query }: { query: string }) {
  return (
    <p className="hg-notice" role="status">
      「{query}」に一致するプレイヤーは見つかりませんでした。
    </p>
  )
}

/* ───────────────────────── FFA ───────────────────────── */

function FfaList({ query }: { query: string }) {
  const [metric, setMetric] = useState<'kills' | 'level'>('kills')
  const top = useMemo(
    () =>
      [...getRankings()]
        .sort((a, b) =>
          metric === 'kills'
            ? b.ffa.kills - a.ffa.kills || b.ffa.level - a.ffa.level
            : b.ffa.level - a.ffa.level || b.ffa.kills - a.ffa.kills,
        )
        .slice(0, 10)
        .map((player, i) => ({ player, rank: i + 1 })),
    [metric],
  )
  const filtered = top.filter(({ player }) => matches(player, query))

  return (
    <>
      <div className="hg-ffa-metrics" role="group" aria-label="FFAランキング指標">
        <button
          type="button"
          aria-pressed={metric === 'kills'}
          onClick={() => setMetric('kills')}
        >
          総侵略数
        </button>
        <button
          type="button"
          aria-pressed={metric === 'level'}
          onClick={() => setMetric('level')}
        >
          FFAティア
        </button>
      </div>
      {filtered.length === 0 ? (
        <Notice query={query} />
      ) : (
        <div className="hg-results-enter" key={metric}>
          {filtered.map(({ player, rank }) => {
            const tier = ffaTier(player.ffa.level)
            return (
              <div key={player.name} className="hg-rank-row hg-ffa-entry">
                <Podium rank={rank} name={player.name} />
                <span className="hg-player">
                  <span className="hg-player-name">{player.name}</span>
                </span>
                <span className="hg-chips hg-ffa-values">
                  {metric === 'kills' ? (
                    <>
                      <span className="hg-ffa-score">
                        {player.ffa.kills.toLocaleString('ja-JP')}
                      </span>
                      <span className="hg-ffa-unit">回</span>
                      <span className={`hg-ffa-tier t${tierLevel(tier)}`}>{tier}</span>
                    </>
                  ) : (
                    <>
                      <span className="hg-ffa-score">{tier}</span>
                      <span className="hg-ffa-unit">FFAティア {player.ffa.level}/10</span>
                    </>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

/* ───────────────────────── Tier grid ───────────────────────── */

function TierGrid({
  mode,
  query,
  onSelect,
}: {
  mode: ModeId
  query: string
  onSelect: (p: Player) => void
}) {
  const columns = useMemo(() => {
    const ranked = getRankings().filter((p) => p.tiers[mode])
    return [1, 2, 3, 4, 5].map((level) =>
      ranked
        .filter((p) => tierLevel(p.tiers[mode]!.tier) === level)
        .sort((a, b) => {
          const ta = a.tiers[mode]!
          const tb = b.tiers[mode]!
          return (
            Number(isHigh(tb.tier)) - Number(isHigh(ta.tier)) ||
            tb.wins - tb.losses - (ta.wins - ta.losses) ||
            a.name.localeCompare(b.name)
          )
        }),
    )
  }, [mode])

  return (
    <div className="hg-tier-grid hg-results-enter" key={mode}>
      {columns.map((members, i) => {
        const level = i + 1
        const shown = members.filter((p) => matches(p, query))
        return (
          <div key={level} className={`hg-tier-column tier-${level}`}>
            <h2>
              {level === 1 && <Trophy />}
              Tier {level}
            </h2>
            {shown.length === 0 && <p className="hg-vacancy">—</p>}
            {shown.map((p) => {
              const r = p.tiers[mode]!
              const high = isHigh(r.tier)
              return (
                <button
                  key={p.name}
                  type="button"
                  className={`hg-member ${high ? 'high' : 'low'}`}
                  onClick={() => onSelect(p)}
                  title={`${p.name} · ${r.tier}`}
                >
                  <PixelAvatar name={p.name} size={26} className="hg-avatar" />
                  <span className="hg-member-name">{p.name}</span>
                  <span className="hg-chevrons" aria-label={high ? 'High Tier' : 'Low Tier'}>
                    {high ? <ChevronsUp /> : <ChevronsDown />}
                  </span>
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

/* ───────────────────────── Profile ───────────────────────── */

function Profile({ player }: { player: Player }) {
  const rank = getRankings().indexOf(player) + 1
  const ffa = ffaTier(player.ffa.level)
  return (
    <>
      <div className="hg-profile-top">
        <PixelAvatar name={player.name} size={64} className="hg-avatar" />
        <div>
          <h2 id="profile-name">{player.name}</h2>
          <p className="hg-profile-sub">
            <Medal /> 総合 {player.overall} · {rankTitle(player.points)} · #{rank} ·{' '}
            {player.points} pt
          </p>
          <p className="hg-profile-sub">
            地域 {player.region}
            {player.matches > 0 &&
              ` · ${player.matches.toLocaleString('ja-JP')} 試合`}{' '}
            · FFA {player.ffa.kills.toLocaleString('ja-JP')} キル（{ffa}）
          </p>
        </div>
      </div>
      <ul className="hg-profile-list">
        {MODES.map((mode) => {
          const r = player.tiers[mode.id]
          return (
            <li key={mode.id}>
              <span className="hg-profile-mode">
                <CategoryIcon category={mode.id} />
                {mode.name}
              </span>
              <span className="hg-profile-record">
                {!r ? '未認定' : r.wins + r.losses > 0 ? `${r.wins}勝 ${r.losses}敗` : '戦績なし'}
              </span>
              <span className={`hg-ffa-tier ${r ? `t${tierLevel(r.tier)}` : ''}`}>
                {r ? r.tier : '—'}
              </span>
            </li>
          )
        })}
      </ul>
    </>
  )
}

/* ───────────────────────── Modal ───────────────────────── */

function Modal({
  open,
  onClose,
  labelledBy,
  children,
}: {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="hg-dialog"
      aria-labelledby={labelledBy}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <button className="hg-close" aria-label="閉じる" type="button" onClick={onClose}>
        ×
      </button>
      {children}
    </dialog>
  )
}

/* ───────────────────────── Footer ───────────────────────── */

function SiteFooter() {
  return (
    <footer className="hg-wrap hg-footer">
      <div className="hg-footer-brand">
        <Link to="/" className="hg-brand">
          <LogoMark size={30} />
          <span className="hg-brand-text">
            <strong>{SITE.name}</strong>
            <small>{SITE.romaji}</small>
          </span>
        </Link>
        <p>{SITE.romaji} · Duel & FFA ランキング</p>
      </div>
      <nav aria-label="ランキング">
        <strong>ランキング</strong>
        <Link to="/">総合</Link>
        <Link to="/rankings/$mode" params={{ mode: 'ffa' }}>
          FFA
        </Link>
        <Link to="/rankings/$mode" params={{ mode: 'sword' }}>
          Sword
        </Link>
        <Link to="/rankings/$mode" params={{ mode: 'crystal' }}>
          Crystal
        </Link>
      </nav>
      <nav aria-label="その他">
        <strong>その他</strong>
        <a href="#server-ip">サーバーIP</a>
        <a href={SITE.discordUrl} target="_blank" rel="noreferrer">
          Discord
        </a>
        <a href="#rankings">ランキングAPI（準備中）</a>
      </nav>
      <p className="hg-unofficial">
        非公式のMinecraftファンサイトです。Mojang および Microsoft による承認・提携はありません。
      </p>
    </footer>
  )
}
