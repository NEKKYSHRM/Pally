"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { getConnections } from "@/app/lib/api/connectionApi";
import { getConversation } from "@/app/lib/api/conversationApi";
import { getMessages } from "@/app/lib/api/messageApi";

import type { ConnectionFriend } from "@/app/types/connection";
import type { Message } from "@/app/types/message";

import type { RootState } from "@/app/store/store";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();

  const conversationId = params.id as string;

  const currentUser = useSelector(
    (state: RootState) => state.auth.user
  );

  const accessToken = useSelector(
    (state: RootState) => state.auth.accessToken
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const [friend, setFriend] =
    useState<ConnectionFriend | null>(null);

  const websocketRef = useRef<WebSocket | null>(null);

  // -----------------------------------------------------------------
  // WebSocket + Conversation + Message History
  // -----------------------------------------------------------------

  useEffect(() => {
    if (!conversationId || !accessToken) {
      return;
    }

    let isActive = true;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError("Unable to connect to chat.");
      setLoading(false);
      return;
    }

    // ---------------------------------------------------------------
    // Load conversation and friend information
    // ---------------------------------------------------------------

    async function loadChatDetails() {
      try {
        const [conversation, connections] =
          await Promise.all([
            getConversation(conversationId),
            getConnections(),
          ]);

        if (!isActive || !currentUser) {
          return;
        }

        const friendId =
          conversation.participant_ids.find(
            (participantId) =>
              participantId !== currentUser.id
          );

        if (!friendId) {
          return;
        }

        const connection = connections.find(
          (item) => item.friend?.id === friendId
        );

        if (connection?.friend) {
          setFriend(connection.friend);
        }
      } catch (err) {
        console.error(
          "Failed to load chat details:",
          err
        );
      }
    }

    loadChatDetails();

    // ---------------------------------------------------------------
    // WebSocket URL
    // ---------------------------------------------------------------

    const websocketUrl = apiUrl
      .replace(/^http:/, "ws:")
      .replace(/^https:/, "wss:");

    const websocket = new WebSocket(
      `${websocketUrl}/ws/conversations/${conversationId}?token=${encodeURIComponent(
        accessToken
      )}`
    );

    websocketRef.current = websocket;

    // ---------------------------------------------------------------
    // WebSocket Open
    // ---------------------------------------------------------------

    websocket.onopen = () => {
      if (
        !isActive ||
        websocketRef.current !== websocket
      ) {
        return;
      }

      console.log("WebSocket connected");

      setIsConnected(true);
    };

    // ---------------------------------------------------------------
    // WebSocket Message
    // ---------------------------------------------------------------

    websocket.onmessage = (event) => {
      if (
        !isActive ||
        websocketRef.current !== websocket
      ) {
        return;
      }

      try {
        const data = JSON.parse(event.data);

        if (
          data.type !== "message" ||
          !data.message
        ) {
          return;
        }

        const incomingMessage =
          data.message as Message;

        setMessages((previousMessages) => {
          const alreadyExists =
            previousMessages.some(
              (message) =>
                message.id === incomingMessage.id
            );

          if (alreadyExists) {
            return previousMessages;
          }

          return [
            ...previousMessages,
            incomingMessage,
          ].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
        });
      } catch (err) {
        console.error(
          "Failed to process WebSocket message:",
          err
        );
      }
    };

    // -----------------------------------------------------------------
    // WebSocket Error
    // -----------------------------------------------------------------

    websocket.onerror = (event) => {
      if (
        !isActive ||
        websocketRef.current !== websocket
      ) {
        return;
      }

      console.error(
        "WebSocket error:",
        event
      );

      setIsConnected(false);
    };

    // -----------------------------------------------------------------
    // WebSocket Close
    // -----------------------------------------------------------------

    websocket.onclose = (event) => {
      console.log(
        "WebSocket disconnected:",
        {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        }
      );

      if (
        !isActive ||
        websocketRef.current !== websocket
      ) {
        return;
      }

      websocketRef.current = null;
      setIsConnected(false);
    };

    // -----------------------------------------------------------------
    // Load Historical Messages
    // -----------------------------------------------------------------

    async function loadMessages() {
      try {
        setLoading(true);
        setError("");

        const data = await getMessages(
          conversationId
        );

        if (!isActive) {
          return;
        }

        setMessages((previousMessages) => {
          const messageMap = new Map<
            string,
            Message
          >();

          for (const message of data) {
            messageMap.set(
              message.id,
              message
            );
          }

          for (const message of previousMessages) {
            messageMap.set(
              message.id,
              message
            );
          }

          return Array.from(
            messageMap.values()
          ).sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
        });
      } catch (err) {
        console.error(
          "Failed to load messages:",
          err
        );

        if (isActive) {
          setError(
            "Unable to load this conversation."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadMessages();

    // -----------------------------------------------------------------
    // Cleanup
    // -----------------------------------------------------------------

    return () => {
      isActive = false;

      console.log("Closing WebSocket");

      if (
        websocketRef.current === websocket
      ) {
        websocketRef.current = null;
        setIsConnected(false);
      }

      websocket.close();
    };
  }, [
    conversationId,
    accessToken,
    currentUser,
  ]);

  // -----------------------------------------------------------------
  // Send Message
  // -----------------------------------------------------------------

  function handleSendMessage(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const content = messageText.trim();

    if (
      !content ||
      sending ||
      !isConnected
    ) {
      return;
    }

    const websocket =
      websocketRef.current;

    if (
      !websocket ||
      websocket.readyState !==
        WebSocket.OPEN
    ) {
      setError(
        "Real-time connection is not available."
      );

      return;
    }

    try {
      setSending(true);

      websocket.send(
        JSON.stringify({
          type: "message",
          content,
        })
      );

      setMessageText("");
    } catch (err) {
      console.error(
        "Failed to send WebSocket message:",
        err
      );

      setError(
        "Unable to send your message."
      );
    } finally {
      setSending(false);
    }
  }

  // -----------------------------------------------------------------
  // Friend Display Helpers
  // -----------------------------------------------------------------

  const friendDisplayName =
    friend?.name ||
    friend?.username ||
    "Friend";

  const friendInitial =
    getInitial(friendDisplayName);

  return (
    <main className="min-h-screen bg-[#fffdfb] text-[#202733] lg:h-screen">
      <div className="relative flex min-h-screen w-full flex-col">

        {/* =========================================================
            Background decoration
        ========================================================== */}

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -bottom-32 -left-40 h-64 w-[560px] rounded-[50%] bg-[#ffe7d2] opacity-70 sm:h-80 sm:w-[700px]" />

          <div className="absolute -bottom-48 -left-48 h-72 w-[760px] rotate-[10deg] rounded-[50%] bg-[#cfe5b7] opacity-60 sm:h-96 sm:w-[900px]" />

          <div className="absolute -bottom-32 -right-40 h-64 w-[560px] rounded-[50%] bg-[#ffe9d7] opacity-70 sm:h-80 sm:w-[700px]" />

          <div className="absolute -bottom-48 -right-48 h-72 w-[760px] -rotate-[10deg] rounded-[50%] bg-[#cfe5b7] opacity-60 sm:h-96 sm:w-[900px]" />
        </div>

        {/* =========================================================
            Chat content
        ========================================================== */}

        <div className="relative z-10 flex min-h-screen flex-col">

          {/* =======================================================
              Header
          ======================================================== */}

          <header className="flex shrink-0 items-center justify-between border-b border-[#eee8e3] bg-white/85 px-5 py-4 backdrop-blur-md sm:px-8 lg:px-10">

            <div className="flex items-center gap-4">

              {/* Back */}

              <button
                type="button"
                onClick={() =>
                  router.push("/chats")
                }
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#697485] transition hover:bg-[#fff5ed] hover:text-[#202733]"
                aria-label="Back to conversations"
              >
                <ArrowLeftIcon />
              </button>

              {/* Friend avatar */}

              {friend?.picture ? (
                <img
                  src={friend.picture}
                  alt={friendDisplayName}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dbe9ce] text-[16px] font-semibold text-[#5d7350]">
                  {friendInitial}
                </div>
              )}

              {/* Friend information */}

              <div>
                <h1 className="text-[17px] font-semibold text-[#202733]">
                  {friendDisplayName}
                </h1>

                <p className="text-[13px] text-[#8a94a3]">
                  {isConnected
                    ? "Online"
                    : "Connecting..."}
                </p>
              </div>
            </div>

            {/* Profile */}

            <Link
              href="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b5cc9d] text-[15px] font-medium text-white"
            >
              {getInitial(
                currentUser?.name
              )}
            </Link>

          </header>

          {/* =======================================================
              Messages
          ======================================================== */}

          <div className="flex min-h-0 flex-1 flex-col">

            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 lg:px-10">

              <div className="mx-auto flex w-full max-w-[850px] flex-col gap-3">

                {loading && (
                  <div className="flex flex-1 items-center justify-center py-20">
                    <p className="text-[16px] text-[#8993a2]">
                      Loading messages...
                    </p>
                  </div>
                )}

                {!loading && error && (
                  <div className="flex flex-1 items-center justify-center py-20">
                    <div className="text-center">
                      <div className="text-[45px]">
                        🐾
                      </div>

                      <p className="mt-3 text-[16px] text-[#8993a2]">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {!loading &&
                  !error &&
                  messages.length === 0 && (
                    <div className="flex flex-1 items-center justify-center py-24">
                      <div className="text-center">
                        <div className="text-[55px]">
                          🐾
                        </div>

                        <h2 className="mt-4 text-[23px] font-semibold text-[#202733]">
                          Start a conversation
                        </h2>

                        <p className="mt-2 text-[15px] text-[#8993a2]">
                          Say hello and start chatting.
                        </p>
                      </div>
                    </div>
                  )}

                {!loading &&
                  !error &&
                  messages.map((message) => {
                    const isMine =
                      message.sender_type ===
                        "user" &&
                      message.sender_id ===
                        currentUser?.id;

                    const isPet =
                      message.sender_type ===
                      "pet";

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isMine
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex max-w-[75%] items-end gap-2 ${
                            isMine
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >

                          {/* Pet avatar */}

                          {isPet && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dbe9ce] text-[16px]">
                              🐾
                            </div>
                          )}

                          {/* Message */}

                          <div
                            className={`rounded-2xl px-4 py-3 text-[15px] leading-[1.45] ${
                              isMine
                                ? "rounded-br-md bg-[#75ad55] text-white"
                                : "rounded-bl-md bg-white text-[#303846] shadow-[0_2px_8px_rgba(32,39,51,0.05)]"
                            }`}
                          >
                            {message.content}
                          </div>

                        </div>
                      </div>
                    );
                  })}

              </div>
            </div>

            {/* =====================================================
                Message input
            ====================================================== */}

            <div className="shrink-0 border-t border-[#eee8e3] bg-white/85 px-5 py-4 backdrop-blur-md sm:px-8 lg:px-10">

              <form
                onSubmit={
                  handleSendMessage
                }
                className="mx-auto flex w-full max-w-[850px] items-center gap-3"
              >

                <input
                  type="text"
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(
                      event.target.value
                    )
                  }
                  placeholder={
                    isConnected
                      ? "Write a message..."
                      : "Connecting..."
                  }
                  disabled={
                    sending ||
                    !isConnected
                  }
                  className="min-w-0 flex-1 rounded-full border border-[#e3e0dd] bg-[#fffdfb] px-5 py-3.5 text-[15px] text-[#202733] outline-none transition placeholder:text-[#a2aab5] focus:border-[#b5cc9d] focus:ring-2 focus:ring-[#dbe9ce]"
                />

                <button
                  type="submit"
                  disabled={
                    sending ||
                    !messageText.trim() ||
                    !isConnected
                  }
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#75ad55] text-white shadow-[0_5px_15px_rgba(117,173,85,0.20)] transition hover:bg-[#68a14b] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <SendIcon />
                </button>

              </form>

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}


// ===============================================================
// Helpers
// ===============================================================

function getInitial(
  value?: string | null
): string {
  if (!value) {
    return "?";
  }

  return value
    .trim()
    .charAt(0)
    .toUpperCase();
}


// ===============================================================
// Arrow left icon
// ===============================================================

function ArrowLeftIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}


// ===============================================================
// Send icon
// ===============================================================

function SendIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}