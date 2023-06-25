'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import type { ITocItem } from './TocItem'

import { throttle } from '~/lib/_'
import { useWrappedElement } from '~/providers/shared/WrappedElementProvider'
import { clsxm } from '~/utils/helper'

import { TocTree } from './TocTree'

export type TocAsideProps = {
  treeClassName?: string
}

export interface TocSharedProps {
  accessory?: React.ReactNode | React.FC
}
export const TocAside: Component<TocAsideProps & TocSharedProps> = ({
  className,
  children,
  treeClassName,
  accessory,
}) => {
  const containerRef = useRef<HTMLUListElement>(null)
  const $article = useWrappedElement()

  if (typeof $article === 'undefined') {
    throw new Error('<Toc /> must be used in <WrappedElementProvider />')
  }
  const $headings = useMemo(() => {
    if (!$article) {
      return []
    }
    return [
      ...$article.querySelectorAll('h1,h2,h3,h4,h5,h6'),
    ] as HTMLHeadingElement[]
  }, [$article])

  const toc: ITocItem[] = useMemo(() => {
    return Array.from($headings).map((el, idx) => {
      const depth = +el.tagName.slice(1)
      const title = el.textContent || ''

      const index = idx

      return {
        depth,
        index: isNaN(index) ? -1 : index,
        title,
        anchorId: el.id,
      }
    })
  }, [$headings])

  useEffect(() => {
    const setMaxWidth = throttle(() => {
      if (containerRef.current) {
        containerRef.current.style.maxWidth = `${
          document.documentElement.getBoundingClientRect().width -
          containerRef.current.getBoundingClientRect().x -
          30
        }px`
      }
    }, 14)
    setMaxWidth()

    window.addEventListener('resize', setMaxWidth)
    return () => {
      window.removeEventListener('resize', setMaxWidth)
    }
  }, [])

  return (
    <aside className={clsxm('st-toc z-[3]', 'relative font-sans', className)}>
      <TocTree
        $headings={$headings}
        containerRef={containerRef}
        className={clsxm('absolute max-h-[75vh]', treeClassName)}
        accessory={accessory}
      />
      {children}
    </aside>
  )
}