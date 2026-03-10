import * as React from "react"
import { cn } from "@/lib/utils"


type UserMessageProps = React.HTMLAttributes<HTMLDivElement> &
  {
    content: React.ReactNode
    timestamp?: string
  }

export default function UserMessage({
  role = "user",
  content,
  timestamp,
  ...props
}: UserMessageProps) {
  return (
    <div
      data-slot="message-row"
      className={"flex w-full justify-end"}
    >
      <div
        data-slot="message"
        {...props}
        className="max-w-1/2 bg-neutral-100 px-6 py-3 rounded-3xl"
      >
        <div>{content}</div>

        {timestamp ? (
          <div className="mt-2 text-[11px] text-muted-foreground opacity-80">
            {timestamp}
          </div>
        ) : null}
      </div>
    </div>
  )
}