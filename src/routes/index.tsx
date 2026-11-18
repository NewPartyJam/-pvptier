import { createFileRoute } from '@tanstack/react-router'

import { RankingsPage } from '@/components/rankings-page'

export const Route = createFileRoute('/')({
  component: () => <RankingsPage category="overall" />,
})
