import { Avatar } from "@/components/ui/avatar";
import { Message } from "@/utils/types";

export function MessageBubble({ message }: { message: Message }) {
  return (
    <div
      key={message.id}
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex items-start gap-2 max-w-[80%] ${
          message.role === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <Avatar className="h-8 w-8">
          {message.role === "user" ? (
            <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-sm">
              U
            </div>
          ) : (
            <div className="bg-muted h-full w-full flex items-center justify-center text-sm">
              AI
            </div>
          )}
        </Avatar>
        <div
          className={`rounded-lg px-4 py-2 ${
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
