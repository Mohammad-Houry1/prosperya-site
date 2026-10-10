import Section from '../common/Section.jsx';
import CmsRichHtml from '../common/CmsRichHtml.jsx';
import CmsImage from '../common/CmsImage.jsx';
import styles from './MarketingSections.module.css';

export default function MarketingSections({ sections = [], steps = [], metrics = [], note = '', gallery = [] }) {
  return <>
    {sections.filter(row=>row.title || row.subtitle || row.description || row.image?.url).map((row,index)=><Section key={row.id ?? index}>
      <div className={styles.section}><div>{row.title && <h2>{row.title}</h2>}{row.subtitle && <p>{row.subtitle}</p>}<CmsImage media={row.image} /></div><CmsRichHtml html={row.description} /></div>
    </Section>)}
    {steps.length > 0 && <Section><ol className={styles.steps}>{steps.map((row,index)=><li key={index}>
      <span className={styles.number}>{String(index+1).padStart(2,'0')}</span><CmsImage media={row.step_image} /><h3>{row.step_title}</h3><CmsRichHtml html={row.step_description} />
    </li>)}</ol></Section>}
    {metrics.length > 0 && <Section><dl className={styles.metrics}>{metrics.map((row,index)=><div key={index}><dd>{row.value}</dd><dt>{row.label}</dt></div>)}</dl></Section>}
    {note && <Section><CmsRichHtml html={note} /></Section>}
    {gallery.length > 0 && <Section><div className={styles.gallery}>{gallery.map((media,index)=><CmsImage key={index} media={media} />)}</div></Section>}
  </>;
}
