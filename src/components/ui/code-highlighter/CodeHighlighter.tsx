import React, {
  useCallback,
  useEffect,
  useInsertionEffect,
  useRef,
  useLayoutEffect,
} from 'react'
import type { FC } from 'react'

import { useIsPrintMode } from '~/atoms/css-media'
import { useIsDark } from '~/hooks/common/use-is-dark'
import { clsxm } from '~/lib/helper'
import { loadScript, loadStyleSheet } from '~/lib/load-script'
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
    toast.success('COPIED!已複製!')
  }, [value])

  const isPrintMode = useIsPrintMode()
  const isDark = useIsDark()

  useLayoutEffect(() => {
    ; (async () => {
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

  useInsertionEffect(() => {
    const css = loadStyleSheet(
      `https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/prism-themes/1.9.0/prism-one-${isPrintMode ? 'light' : isDark ? 'dark' : 'light'
      }.css`,
    )

    if (prevThemeCSS.current) {
      const $prev = prevThemeCSS.current
      css.$link.onload = () => {
        $prev.remove()
      }
    }

    prevThemeCSS.current = css
  }, [isDark, isPrintMode])
  useInsertionEffect(() => {
    loadStyleSheet(
      'https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/prism/1.23.0/plugins/line-numbers/prism-line-numbers.min.css',
    )

    Promise.all([
      loadScript(
        'https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/prism/1.23.0/components/prism-core.min.js',
      ),
    ])
      .then(() =>
        Promise.all([
          loadScript(
            'https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/prism/1.23.0/plugins/autoloader/prism-autoloader.min.js',
          ),
          loadScript(
            'https://lf3-cdn-tos.bytecdntp.com/cdn/expire-1-M/prism/1.23.0/plugins/line-numbers/prism-line-numbers.min.js',
          ),
        ]),
      )
      .then(() => {
        if (ref.current) {
          requestAnimationFrame(() => {
            window.Prism?.highlightElement(ref.current)

            requestAnimationFrame(() => {
              window.Prism?.highlightElement(ref.current)
            })
          })
        } else {
          requestAnimationFrame(() => {
            window.Prism?.highlightAll()
            // highlightAll twice

            requestAnimationFrame(() => {
              window.Prism?.highlightAll()
            })
          })
        }
      })
  }, [])
}
// import { useCallback, useEffect, useRef } from 'react'
// import type { FC } from 'react'

// // import { useIsPrintMode } from '~/atoms/css-media'
// // import { useIsDark } from '~/hooks/common/use-is-dark'
// import { clsxm } from '~/lib/helper'
// import { renderCodeHighlighter } from './render.server'
// import { toast } from '~/lib/toast'

// import styles from './CodeHighlighter.module.css'

// declare global {
//   interface Window {
//     Prism: any
//   }
// }

// interface Props {
//   lang: string | undefined;
//   content: string;
//   className?: string;
//   style?: React.CSSProperties;
// }

// export const HighLighter: FC<Props> = (props) => {
//   const { lang: language, content: value, className, style } = props

//   const handleCopy = useCallback(() => {
//     navigator.clipboard.writeText(value)
//     toast.success('COPIED！已复制！')
//   }, [value])

//   const ref = useRef<HTMLElement>(null)
//   useLoadHighlighter(ref)
//   return (
//     <div className={styles['code-wrap']}>
//       <span className={styles['language-tip']} aria-hidden>
//         {language?.toUpperCase()}
//       </span>

//       <pre className={clsxm('!bg-transparent', className)} style={style} data-start="1">
//         <code
//           className={`language-${language ?? 'markup'} !bg-transparent`}
//           ref={ref}
//         >
//           {value}
//         </code>
//       </pre>

//       <div className={styles['copy-tip']} onClick={handleCopy} aria-hidden>
//         Copy
//       </div>
//     </div>
//   )
// }

// export const BaseCodeHighlighter: FC<Props> = ({ content, lang, className, style }) => {
//   const ref = useRef<HTMLElement>(null);
//   useLoadHighlighter(ref);

//   useEffect(() => {
//     if (ref.current) {
//       // 提供一个默认值，确保 lang 不是 undefined
//       const language = lang || 'markup';
//       renderCodeHighlighter(content, language, 'dark-plus').then((html) => {
//         if (ref.current) {
//           ref.current.innerHTML = html;
//         }
//       });
//     }
//   }, [content, lang]);

//   return (
//     <pre
//       className={clsxm('!bg-transparent', className)}
//       style={style}
//       data-start="1"
//     >
//       <code
//         className={`language-${lang ?? 'markup'} !bg-transparent`}
//         ref={ref}
//       >
//         {content}
//       </code>
//     </pre>
//   );
// };

// const useLoadHighlighter = (ref: React.RefObject<HTMLElement>) => {
//   useEffect(() => {
//     if (ref.current) {
//       // 提供一个默认值，确保 lang 不是 undefined
//       const language = ref.current.getAttribute('class')?.split(' ').find(c => c.startsWith('language-'))?.replace('language-', '') || 'markup';
//       renderCodeHighlighter(ref.current.textContent || '', language, 'dark-plus').then((html) => {
//         if (ref.current) {
//           ref.current.innerHTML = html;
//         }
//       });
//     }
//   }, []);
// };