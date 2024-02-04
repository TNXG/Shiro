import { useCallback, useEffect, useRef } from 'react'
import type { FC } from 'react'

// import { useIsPrintMode } from '~/atoms/css-media'
// import { useIsDark } from '~/hooks/common/use-is-dark'
import { clsxm } from '~/lib/helper'
import { renderCodeHighlighter } from './render.server'
import { toast } from '~/lib/toast'

import styles from './CodeHighlighter.module.css'

declare global {
  interface Window {
    Prism: any
  }
}

interface Props {
  lang: string | undefined;
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export const HighLighter: FC<Props> = (props) => {
  const { lang: language, content: value, className, style } = props

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

      <pre className={clsxm('!bg-transparent', className)} style={style} data-start="1">
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

export const BaseCodeHighlighter: FC<Props> = ({ content, lang, className, style }) => {
  const ref = useRef<HTMLElement>(null);
  useLoadHighlighter(ref);

  useEffect(() => {
    if (ref.current) {
      renderCodeHighlighter(content, lang, 'dark-plus').then((html) => {
        if (ref.current) { // 添加非空检查
          ref.current.innerHTML = html;
        }
      });
    }
  }, [content, lang]);

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
  );
};

const useLoadHighlighter = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (ref.current) {
      renderCodeHighlighter(ref.current.textContent || '', 'markup', 'dark-plus').then((html) => {
        if (ref.current) { // 添加非空检查
          ref.current.innerHTML = html;
        }
      });
    }
  }, []);
};