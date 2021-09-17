import classNames from 'classnames'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { useAtomValue } from 'jotai/utils'
import { memo, useEffect, useMemo, useState } from 'react'
import isEqual from 'react-fast-compare'
import type { Hit, InfiniteHitsProvided } from 'react-instantsearch-core'
import {
  connectHitInsights,
  connectInfiniteHits,
} from 'react-instantsearch-dom'

import { LoadLess } from '@instantsearch/widgets/load-less/load-less'
import { LoadMore } from '@instantsearch/widgets/load-more/load-more'

import type { ViewMode } from '@/components/view-modes/view-modes'
import { searchInsightsAtom } from '@/layouts/app-layout'

export type HitComponentProps = {
  viewMode?: ViewMode
  hit: Hit
}

export type InfiniteHitsProps = InfiniteHitsProvided & {
  hitComponent: React.ComponentType<any>
  showLess?: boolean
  showMore?: boolean
  viewMode?: ViewMode
  animation?: boolean
  gridClassName?: string
  listClassName?: string
}

const listItemTransition = {
  ease: [0.16, 1, 0.3, 1],
  duration: 0.6,
}

const listItemVariants = {
  hidden: { opacity: 0 },
  show: (i: number) => ({
    opacity: 1,
    transition: {
      delay: i * 0.06,
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

function InfiniteHitsComponent({
  hits,
  hasPrevious,
  refinePrevious,
  hitComponent: HitComponent,
  showLess = false,
  showMore = false,
  viewMode = 'grid',
  animation = true,
  gridClassName = 'grid-cols-2 laptop:grid-cols-5',
  listClassName = 'laptop:grid-cols-2',
}: InfiniteHitsProps) {
  const [hitsPerPage, setHitsPerPage] = useState(0)
  const shouldReduceMotion = useReducedMotion()
  const searchInsights = useAtomValue(searchInsightsAtom)

  useEffect(() => {
    if (!hitsPerPage) setHitsPerPage(hits.length)
  }, [hitsPerPage, hits.length])

  const ConnectedHitComponent: React.ComponentType<any> = useMemo(
    () =>
      searchInsights
        ? connectHitInsights(searchInsights)(HitComponent)
        : HitComponent,
    [searchInsights, HitComponent]
  )

  return (
    <section className="w-full">
      {showLess && (
        <LoadLess hasPrevious={hasPrevious} refinePrevious={refinePrevious} />
      )}

      <m.ol
        className={classNames('overflow-hidden', {
          [classNames('grid grid-cols-2 gap-2', gridClassName)]:
            viewMode === 'grid',
          [classNames(
            'flex flex-col gap-4 laptop:grid laptop:gap-0',
            listClassName
          )]: viewMode === 'list',
        })}
        initial="hidden"
        animate="show"
        exit="hidden"
      >
        <AnimatePresence>
          {hits.map((hit, i) => (
            <m.li
              key={hit.objectID}
              layout={shouldReduceMotion || !animation ? false : 'position'}
              transition={listItemTransition}
              variants={listItemVariants}
              custom={i % hitsPerPage}
            >
              <ConnectedHitComponent hit={hit} viewMode={viewMode} />
            </m.li>
          ))}
        </AnimatePresence>
      </m.ol>

      {showMore && <LoadMore />}
    </section>
  )
}

export const InfiniteHits = connectInfiniteHits(
  memo(InfiniteHitsComponent, isEqual)
)
