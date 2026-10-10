import Skeleton from './Skeleton.jsx';
import styles from './PageSkeletons.module.css';

function Copy({ large = false }) { return <div className={styles.copy}><Skeleton width="24%" height={14} /><Skeleton width="92%" height={large ? 88 : 56} /><Skeleton width="72%" height={large ? 70 : 42} /><Skeleton height={18} /><Skeleton width="84%" height={18} /><Skeleton width="42%" height={44} /></div>; }
function Image({ height = 340 }) { return <Skeleton height={height} className={styles.image} />; }
function Rows({ count = 3 }) { return <div className={styles.rows}>{Array.from({length:count},(_,i)=><div className={styles.row} key={i}><Skeleton width="12%" height={22} /><Skeleton width="65%" height={35} /><Skeleton width="90%" height={16} /></div>)}</div>; }
function Cards({ count = 3 }) { return <div className={styles.cards}>{Array.from({length:count},(_,i)=><div key={i}><Image height={170} /><Skeleton width="80%" height={28} /><Skeleton height={16} /><Skeleton width="60%" height={16} /></div>)}</div>; }
function Metrics() { return <div className={styles.metrics}>{[0,1,2,3].map(i=><div key={i}><Skeleton height={48} /><Skeleton height={14} /></div>)}</div>; }
function Split({ children }) { return <div className={styles.split}>{children}</div>; }
function Reading() { return <div className={styles.reading}><Skeleton width="80%" height={38} />{Array.from({length:9},(_,i)=><Skeleton key={i} width={i%3===2?'72%':'100%'} height={18} />)}</div>; }
function Form() { return <div className={styles.form}>{[0,1,2,3,4,5].map(i=><div key={i}><Skeleton width="45%" height={14} /><Skeleton height={48} /></div>)}<Skeleton height={120} /><Skeleton width="50%" height={48} /></div>; }

export function skeletonKind(pathname) {
  const [, page, slug] = pathname.split('/').filter(Boolean);
  if (!page) return 'home';
  if (page==='expertise') return slug?'expertise-detail':'expertise';
  if (page==='solutions') return slug?'solution-detail':'solutions';
  if (page==='work') return slug?'case-study':'work';
  if (page==='insights') return slug?'article':'insights';
  if (['corporate','privacy-policy','terms-of-use','cookie-policy','accessibility'].includes(page)) return 'legal';
  return ['about','approach','contact'].includes(page)?page:'not-found';
}

export default function PageSkeletons({ kind }) {
  switch(kind) {
    case 'home': return <><Split><Copy large /><Image height={460} /></Split><Metrics /><Split><Copy /><Rows /></Split><Cards /></>;
    case 'about': return <><Split><Copy large /><Image height={380} /></Split><Split><Reading /><Metrics /></Split><Cards count={2} /></>;
    case 'approach': return <><Copy large /><Metrics /><Split><Rows count={4} /><Image height={400} /></Split><Split><Image height={280} /><Rows /></Split></>;
    case 'expertise': return <><Split><Copy large /><Rows count={6} /></Split><Split><Image height={420} /><Rows count={4} /></Split></>;
    case 'expertise-detail': return <><Split><Copy /><Image height={400} /></Split><Metrics /><Split><Skeleton width="70%" height={46} /><Reading /></Split><Cards /></>;
    case 'solutions': return <><Copy large /><div className={styles.strip}><Image height={210}/><Image height={210}/><Image height={210}/><Image height={210}/></div><Split><Copy /><Rows count={4}/></Split></>;
    case 'solution-detail': return <><Split><Copy /><Image height={380}/></Split><Reading /><Split><Rows /><Rows /></Split><Split><Image height={280}/><Copy /></Split></>;
    case 'work': return <><Split><Copy large /><div className={styles.deck}><Image height={320}/><Image height={320}/></div></Split><Metrics /><Split><Image height={340}/><Copy /></Split><Cards count={2}/></>;
    case 'case-study': return <><Split><Copy large /><div><Image height={320}/><Metrics /></div></Split><Split><Reading /><Rows /></Split><Image height={400}/><Metrics /></>;
    case 'contact': return <><Split><Copy large /><Form /></Split><Rows count={5}/></>;
    case 'insights': return <><Copy /><Split><Image height={360}/><Copy /></Split><Metrics /><Cards count={6}/></>;
    case 'article': return <><div className={styles.articleHead}><Copy large /><Image height={390}/></div><Reading /><Cards /></>;
    case 'legal': return <><Copy /><div className={styles.document}><Rows count={5}/><Reading /></div></>;
    default: return <Split><Copy /><Image height={300}/></Split>;
  }
}
