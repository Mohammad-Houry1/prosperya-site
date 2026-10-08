import { useEffect, useState } from 'react';
import { request } from '../api';
export default function ArticleList() {
  const [articles,setArticles]=useState(null);
  const [error,setError]=useState('');
  useEffect(()=>{ let current=true; request('/articles').then(data=>{if(current)setArticles(data.data);}).catch(error=>{if(current)setError(error.message);}); return()=>{current=false;}; },[]);
  return <section aria-labelledby="articles-title"><h2 id="articles-title">Latest articles</h2>
    {error && <p role="alert">{error}</p>}
    {!articles && !error && <p>Loading articles…</p>}
    {articles?.length === 0 && <p>No articles yet.</p>}
    {articles?.map(article=><article key={article.id}><h3>{article.title}</h3><p>{article.excerpt}</p></article>)}
  </section>;
}
