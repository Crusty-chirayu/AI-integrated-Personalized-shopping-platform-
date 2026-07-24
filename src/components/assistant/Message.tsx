"use client";

import React from "react";

type Props = {
  role: "user" | "assistant";
  children: React.ReactNode;
};

export default function Message({
  role,
  children,
}: Props) {

  const isUser = role === "user";

  return (

    <div
      className={`flex ${
        isUser
          ? "justify-end"
          : "justify-start"
      }`}
    >

      <div
        className={`max-w-4xl rounded-2xl px-5 py-4 shadow-sm ${
          isUser
            ? "bg-black text-white"
            : "bg-zinc-100 text-zinc-900"
        }`}
      >

        {children}

      </div>

    </div>

  );

}