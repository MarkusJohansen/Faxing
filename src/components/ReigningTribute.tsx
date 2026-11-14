import type { Tribute } from '../lib/tribute'
import { formatDate, formatTime } from '../lib/format'

interface Props {
  tribute: Tribute
}

/** Honours the crowns of the last official Faxing. Which crowns reign is decided in lib/tribute. */
export default function ReigningTribute({ tribute }: Props) {
  const { event, crowns } = tribute
  return (
    <section className="reigning-tribute" aria-labelledby="reigning-tribute-title">
      <p className="eyebrow">Ære være dem</p>
      <h3 id="reigning-tribute-title" className="reigning-title">De Regjerende</h3>
      <p className="reigning-origin">Kronet ved «{event.name}» den {formatDate(event.date)}</p>
      <ul className="reigning-list">
        {crowns.map(crown => (
          <li key={crown.id} className="reigning-row">
            <span className="royal-crown" aria-hidden="true">♛</span>
            <span className="reigning-crown-title">{crown.title}</span>
            <strong className="reigning-name">{crown.name}</strong>
            <span className="reigning-time">{formatTime(crown.elapsed)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
