import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'
import type { FC } from 'react'

import { useIsPrintMode } from '~/atoms/css-media'
import { useIsDark } from '~/hooks/common/use-is-dark'
import { clsxm } from '~/lib/helper'
import { toast } from '~/lib/toast'

import styles from './CodeHighlighter.module.css'
import { renderCodeHighlighter } from './render.server'

declare global {
  interface Window {
    Prism: any
  }
}

interface Props {
  lang: string | undefined
  content: string
}

export const HighLighter: FC<Props> = (props) => {
  const { lang: language, content: value } = props
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value)
    toast.success('COPIED！已复制！')
  }, [value])

  const ref = useRef<HTMLElement>(null)
  useLoadHighlighter(ref)
  return (
    <div className={styles['code-wrap']}>
      <span className={styles['language-tip']} aria-hidden>
        {language?.toUpperCase()}
      </span>

      <pre className="line-numbers !bg-transparent" data-start="1">
        <code
          className={`language-${language ?? 'markup'} !bg-transparent`}
          ref={ref}
        >
          {value}
        </code>
      </pre>

      <div className={styles['copy-tip']} onClick={handleCopy} aria-hidden>
        Copy
      </div>
    </div>
  )
}

export const BaseCodeHighlighter: Component<
  Props & {
    style: React.CSSProperties
  }
> = ({ content, lang, className, style }) => {
  const ref = useRef<HTMLElement>(null)
  useLoadHighlighter(ref)

  useEffect(() => {
    window.Prism?.highlightElement(ref.current)
  }, [content, lang])
  return (
    <pre
      className={clsxm('!bg-transparent', className)}
      style={style}
      data-start="1"
    >
      <code
        className={`language-${lang ?? 'markup'} !bg-transparent`}
        ref={ref}
      >
        {content}
      </code>
    </pre>
  )
}

const useLoadHighlighter = (ref: React.RefObject<HTMLElement>) => {
  const prevThemeCSS = useRef<ReturnType<typeof loadStyleSheet>>()
  const isPrintMode = useIsPrintMode()
  const isDark = useIsDark()

  useLayoutEffect(() => {
    ;(async () => {
      const shikiTheme = 'dark-plus'
      const html = await renderCodeHighlighter(
        value,
        language as string,
        shikiTheme, // 始终使用 'dark_plus' 主题
      )
      if (!ref.current) {
        return
      }
      ref.current.innerHTML = html
    })()
  }, [isDark, value, language, isPrintMode])

  const ref = useRef<HTMLElement>(null)
  return (
    <div className={styles['code-wrap']}>
      <span className={styles['language-tip']} aria-hidden>
        {language?.toUpperCase()}
      </span>

      <pre
        className="line-numbers !bg-transparent"
        data-start="1"
        style={{ fontFamily: 'JetBrainsMono' }}
      >
        <code
          className={`language-${language ?? 'markup'} !bg-transparent`}
          ref={ref}
          style={{ fontFamily: 'JetBrainsMono' }}
        >
          {value}
        </code>
      </pre>

      <div className={styles['copy-tip']} onClick={handleCopy} aria-hidden>
        Copy
      </div>
    </div>
  )
}
