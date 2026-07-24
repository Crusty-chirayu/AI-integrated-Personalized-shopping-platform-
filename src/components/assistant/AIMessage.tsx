"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  message: string;
  streaming?: boolean;
};

export default function AIMessage({
  message,
  streaming = false,
}: Props) {
  const [displayed, setDisplayed] =
    useState(streaming ? "" : message);

  useEffect(() => {

    if (!streaming) {
      setDisplayed(message);
      return;
    }

    setDisplayed("");

    let index = 0;

    const interval = setInterval(() => {

      index++;

      setDisplayed(
        message.slice(0, index)
      );

      if (index >= message.length) {
        clearInterval(interval);
      }

    }, 10);

    return () => clearInterval(interval);

  }, [message, streaming]);

  return (
    <div className="prose max-w-none prose-zinc">

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
      >
        {displayed}
      </ReactMarkdown>

    </div>
  );
}