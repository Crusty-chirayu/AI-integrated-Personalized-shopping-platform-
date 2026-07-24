
"use client";

import { Trash2 } from "lucide-react";

type Conversation = {
  id: string;
  title: string;
};

type Props = {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onDelete: (id: string) => void;
};

export default function ConversationSidebar({
  conversations,
  selectedId,
  onSelect,
  onNewChat,
  onDelete,
}: Props)

{
  return (
    <div className="w-72 border-r bg-zinc-50 flex flex-col">

      <div className="p-4">

        <button
          onClick={onNewChat}
          className="w-full rounded-xl bg-black px-4 py-3 text-white hover:bg-zinc-800"
        >
          + New Chat
        </button>

      </div>

      <div className="flex-1 overflow-y-auto">

        {conversations.map((conversation) => (




<div
  key={conversation.id}
  className={`group flex items-center justify-between px-4 py-3 transition
    ${
      selectedId === conversation.id
        ? "bg-black text-white"
        : "hover:bg-zinc-100"
    }`}
>

  <button
    onClick={() => onSelect(conversation.id)}
    className="flex-1 truncate text-left"
  >
    {conversation.title}
  </button>
<button
  onClick={() => onDelete(conversation.id)}
  title="Delete chat"
  className="
    ml-2
    rounded-md
    p-1
    text-red-500
    opacity-0
    transition-all
    duration-200
    group-hover:opacity-100
    hover:bg-red-50
    hover:text-red-600
  "
>
  <Trash2 size={16} />
</button>

</div>




        ))}

      </div>

    </div>
  );
}