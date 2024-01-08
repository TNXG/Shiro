'use client'

import dayjs from 'dayjs'

import { Banner } from '~/components/ui/banner'
import { RelativeTime } from '~/components/ui/relative-time'
import { useCurrentPostDataSelector } from '~/providers/post/CurrentPostDataProvider'

export const PostOutdate = () => {
  const time = useCurrentPostDataSelector((s) => s?.modified)
  if (!time) {
    return null
  }
  return dayjs().diff(dayjs(time), 'day') > 120 ? (
    <Banner type="warning" className="my-10">
      <span className="leading-[1.8]">
        这篇文章上次修改于 <RelativeTime date={time} />
        ，距今已经过去了 {dayjs().diff(dayjs(time), 'day')} 天
        ，部分内容可能已经不再适用，如有疑问可询问作者。
      </span>
    </Banner>
  ) : null
}
