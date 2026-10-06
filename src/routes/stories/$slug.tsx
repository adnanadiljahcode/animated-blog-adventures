import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Header, Footer } from '@/components/blog/header'
import { Button } from '@/components/ui/button'
import { stories } from '@/lib/stories'
export const Route = createFileRoute('/stories/$slug')({
 loader:({params})=>{const story=stories.find(item=>item.slug===params.slug);if(!story)throw notFound();return story},
 head:({loaderData})=>({meta:[{title:`${loaderData?.title??'Story'} — Elsewhere Journal`},{name:'description',content:loaderData?.subtitle??'Stories for curious minds at Elsewhere.'},{property:'og:title',content:`${loaderData?.title??'Story'} — Elsewhere`},{property:'og:description',content:loaderData?.subtitle??'A fresh perspective from Elsewhere.'},{property:'og:type',content:'article'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Story,
})
function Story(){
 const story=Route.useLoaderData()
 return <><Header/><main className="page-width article-page reveal"><Link to="/" className="back-link"><ArrowLeft/>Back to the journal</Link><div className="article-heading"><div className="eyebrow">{story.category} · {story.minutes} min read</div><h1>{story.title}</h1><p>{story.subtitle}</p><div className="author"><span className="avatar">{story.initials}</span><span>By {story.author} · {story.date}</span></div></div><img className="article-cover" src={story.image} alt={story.subtitle} width={1600} height={912}/><div className="article-body"><p className="lede">{story.intro}</p>{story.paragraphs.map(paragraph=><p key={paragraph.slice(0,30)}>{paragraph}</p>)}<div className="article-end"><span>Stay curious. Go elsewhere.</span><Button asChild variant="outline"><Link to="/">More stories <ArrowUpRight/></Link></Button></div></div></main><Footer/></>
}
