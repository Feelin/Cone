"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  content: z.string().min(1, {
    message: "Comment cannot be empty.",
  }),
})

type CommentInputProps = {
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void> | void
  initialContent?: string
  placeholder?: string
  submitLabel?: string
  className?: string
  isLoading?: boolean
}

export function CommentInput({
  onSubmit,
  initialContent = "",
  placeholder = "Add a comment...",
  submitLabel = "Comment",
  className = "",
  isLoading = false,
}: CommentInputProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: initialContent,
    },
  })

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    try {
      await onSubmit(values)
    } catch (error) {
      console.error("Failed to submit comment:", error)
    }
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder={placeholder}
                    className="min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
