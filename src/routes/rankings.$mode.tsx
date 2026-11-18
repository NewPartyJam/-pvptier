import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

import { RankingsPage } from '@/components/rankings-page'
import { SITE, getMode, isCategory, type Category } from '@/data/rankings'

export const Route = createFileRoute('/rankings/$mode')({
  beforeLoad: ({ params }) => {
    if (params.mode === 'overall') throw redirect({ to: '/' })
    if (!isCategory(params.mode)) throw notFound()
  },
  head: ({ params }) => {
    const label =
      params.mode === 'ffa' ? 'FFA' : (getMode(params.mode)?.name ?? params.mode)
    return { meta: [{ title: `${label} ランキング · ${SITE.name}` }] }
  },
  component: ModeRankings,
})

function ModeRankings() {
  const { mode } = Route.useParams()
  return <RankingsPage category={mode as Category} />
}
