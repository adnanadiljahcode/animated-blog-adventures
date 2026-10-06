import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Asterisk } from 'lucide-react'
import { Button } from '@/components/ui/button'
export function Header() {
  return <header className="site-header"><div className="page-width header-inner"><Link to="/" className="wordmark" aria-label="Elsewhere home"><Asterisk aria-hidden="true"/>elsewhere<span className="logo-dot">.</span></Link><span className="header-note">A journal for the curious.</span><Button asChild variant="outline" className="explore-button"><a href="/#stories">Explore stories <ArrowUpRight/></a></Button></div></header>
}
export function Footer() {
 return <footer className="page-width site-footer"><Link to="/" className="wordmark"><Asterisk/>elsewhere<span className="logo-dot">.</span></Link><p>Good stories. New perspectives.</p><span>© 2026 Elsewhere Journal</span></footer>
}
