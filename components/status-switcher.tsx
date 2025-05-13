"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command,  CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import {statusMap} from "@/components/rss-feed";

export function StatusSwitcher() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams?.get("status") || ''

  const [open, setOpen] = useState(false)

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams)
    const prevStatus = (params.get("status") || "").split(",");
    const newStatus = prevStatus.includes(value) ? prevStatus.filter((status) => status !== value) : prevStatus.concat(value);
    params.set("status", newStatus.filter(i => i).join(","))
    router.push(`/?${params.toString()}`)
    setOpen(false)
  }


  // 查找当前源名称
  const currentStatusName = currentStatus.split(",").map((status) => statusMap[status]).join(",") || "选择状态"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full md:w-[300px] justify-between">
          {currentStatusName}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full md:w-[300px] p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {Object.entries(statusMap).map(([value, text]) => {
              return <CommandItem key={value} value={value} onSelect={() => handleSelect(value)}>
                <Check className={cn("mr-2 h-4 w-4", currentStatus?.split(",").includes(value) ? "opacity-100" : "opacity-0")} />
                {text}
              </CommandItem>
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
