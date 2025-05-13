"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import {getSourcesByCategory, type RssSource, findSourceByName, defaultSource} from "@/config/rss-config"

export function SourceSwitcher() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSource = searchParams.get("source")

  const [open, setOpen] = useState(false)

  const handleSelect = (source: RssSource) => {
    const params = new URLSearchParams(searchParams)
    params.set("source", source.name)
    router.push(`/?${params.toString()}`)
    setOpen(false)
  }

  // 按类别分组源
  const groupedSources = getSourcesByCategory()

  // 查找当前源名称
  const currentSourceName = currentSource || defaultSource.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full md:w-[300px] justify-between">
          {currentSourceName}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full md:w-[300px] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandInput placeholder="搜索产品..." autoFocus={false} />
          <CommandList>
            <CommandEmpty>未找到匹配的产品</CommandEmpty>
            {Object.entries(groupedSources).map(([category, categorySources]) => {
              const sources = categorySources as RssSource[];
              return (
                <CommandGroup key={category} heading={category}>
                  {sources.map((source: RssSource) => (
                    <CommandItem key={source.name} value={source.name} onSelect={() => handleSelect(source)}>
                      <Check className={cn("mr-2 h-4 w-4", currentSource === source.url ? "opacity-100" : "opacity-0")} />
                      {source.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
