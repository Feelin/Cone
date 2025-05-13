import React, {Suspense} from "react"
import {RssFeed} from "@/components/rss-feed"
import {SourceSwitcher} from "@/components/source-switcher"
import {ThemeToggle} from "@/components/theme-toggle"
import {ScrollToTop} from "@/components/scroll-to-top"
import {StatusSwitcher} from "@/components/status-switcher";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container py-10 mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
        <Link href="/" className="text-4xl font-bold hover:text-primary transition-colors">
            Cone
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
        <p className="text-muted-foreground mb-8">Changelogs in one place, AI generated summary</p>
        <div className="mb-8">
          <Suspense fallback={<div className="w-full md:w-[300px] h-10 bg-muted rounded-md animate-pulse"/>}>
            <div className="flex gap-2 justify-between">
              <SourceSwitcher/>
              <StatusSwitcher/>
            </div>
          </Suspense>

        </div>

        <Suspense fallback={<FeedSkeleton/>}>
          <RssFeed/>
        </Suspense>
      </div>

      <ScrollToTop/>
    </main>
  )
}

function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({length: 5}).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 space-y-4 feed-card">
          <div className="h-7 bg-muted rounded-md animate-pulse w-3/4"/>
          <div className="h-4 bg-muted rounded-md animate-pulse w-1/2"/>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded-md animate-pulse w-full"/>
            <div className="h-4 bg-muted rounded-md animate-pulse w-full"/>
            <div className="h-4 bg-muted rounded-md animate-pulse w-4/5" />
          </div>
        </div>
      ))}
    </div>
  )
}
