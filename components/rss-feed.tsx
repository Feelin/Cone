"use client"

import {useSearchParams} from "next/navigation"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Badge} from "@/components/ui/badge"
import {Skeleton} from "@/components/ui/skeleton"
import {defaultSource, findSourceByName} from "@/config/rss-config"
import {ExternalLink, RefreshCw} from "lucide-react"
import {api} from "@/trpc/react"
import Markdown from 'react-markdown'
import {Button} from "@/components/ui/button";
import React, { useEffect } from "react";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import { CommentInput } from '@/components/ui/comment-input'

export const statusMap: {[key: string]: string} = {
  1: '未读',
  2: '已读',
  3: '待跟进',
  4: '已跟进'
}



function ListItem({ item, index }: any) {
  const searchParams = useSearchParams()
  const source = searchParams?.get("source") || defaultSource.name;
  const addHost = (content: string) => {
    const host = findSourceByName(source)?.url.split("/")[2]
    return content.replace(/<img[^>]*>/g, (match) => {
      return match.replace(/src="([^"]+)"/, `src="https://${host}$1"`)
    }).replace(/<source[^>]*>/g, (match) => {
      return match.replace(/src="([^"]+)"/, `src="https://${host}$1"`)
    })
  }
  const utils = api.useUtils();
  const {mutate: reGenerate, isPending} = api.feature.generateSummaryById.useMutation({
    onSuccess: (data) => {
      utils.feature.query.invalidate();
    }
  })

  const {mutate: updateStatus} = api.feature.updateStatus.useMutation();
  const {mutate: updateComment, isPending: updateCommentPending} = api.feature.setComment.useMutation();

  return (
    <Card key={item.id} className="feed-card relative">
      <div className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-md">
        {index + 1}
      </div>
      <CardHeader>
        <CardTitle className="text-xl">
          <a
            href={item.link as string}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1"
          >
            {item.title}
            <ExternalLink className="h-4 w-4 inline" />
          </a>
          <div className="w-40 absolute right-4 top-4">
            <Select onValueChange={(value) => {
              console.log(typeof item.id, item.id, value);
              updateStatus({
                id: item.id,
                status: Number(value)
              });
            }} >
              <SelectTrigger>
                <SelectValue placeholder={statusMap[item.status]} />
              </SelectTrigger>
              <SelectContent>
                {
                  Object.keys(statusMap).map((key) => {
                    return <SelectItem value={key} key={key}>{statusMap[key]}</SelectItem>
                  })
                }
              </SelectContent>
            </Select>
          </div>

        </CardTitle>
        <CardDescription>
          {new Date(item.created_at).toLocaleString("zh-CN")}

        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">AI 摘要</TabsTrigger>
            <TabsTrigger value="original">原文内容</TabsTrigger>
          </TabsList>
          <TabsContent value="summary" className="space-y-2">
            <div className="text-sm text-muted-foreground mb-2">由 AI 生成的摘要：</div>
            <div className="text-foreground whitespace-pre-line">
              {
                isPending ? '请稍等，重新生成AI摘要中...' : <Markdown>{item.summary}</Markdown>
              }
            </div>
            <Button onClick={() => reGenerate(Number(item.id))} size="sm" variant="outline" disabled={isPending}> <RefreshCw className="mr-2 h-4 w-4" /> 重新生成</Button>
          </TabsContent>
          <TabsContent value="original">
            <div
              className="text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: addHost(item.content || "") || "无内容",
              }}
            />
          </TabsContent>
        </Tabs>
        <div className="mt-4">
          <CommentInput 
            initialContent={item.comment || ''}
            onSubmit={async (values: {content: string}) => {
              console.log("New comment:", values.content)
              updateComment({
                id: item.id,
                comment: values.content
              });
            }}
            isLoading={updateCommentPending}
            placeholder="备注"
            submitLabel="保存"
          />
        </div>
      </CardContent>
    </Card>
  );
}


export function RssFeed() {
  const searchParams = useSearchParams()
  const source = searchParams?.get("source") || defaultSource.name
  const displayTitle = source || defaultSource.name;
  const status = searchParams?.get("status");
  
  const {data: features, isLoading, isError} = api.feature.query.useQuery({
    product: displayTitle,
    status: status ? status.split(",").map(Number) : undefined
  })

  if (isError) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">数据获取失败，请检查数据源是否出错</p>
        </CardContent>
      </Card>
    )
  }

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []); 

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">{displayTitle}</h2>
          {source && <Badge variant="outline">{findSourceByName(source)?.category}</Badge>}
          <span className="text-xs text-muted-foreground">
                更新于: {features?.[0]?.created_at && new Date(features?.[0]?.created_at || "").toLocaleString("zh-CN")}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="feed-card">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {features?.map((item, index) => <ListItem key={item.id} item={item} index={index} id={item.hash}></ListItem>)}
        </div>
      )}
    </div>
  )
}

