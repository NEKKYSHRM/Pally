"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { getConnections } from "@/app/lib/api/connectionApi";
import { getConversation } from "@/app/lib/api/conversationApi";
import { getMessages } from "@/app/lib/api/messageApi";
import { getPet } from "@/app/lib/api/petApi";
import RelationshipSettings from "@/app/components/chat/RelationshipSettings";
import type { Connection, ConnectionFriend } from "@/app/types/connection";
import type { Message } from "@/app/types/message";

import type { RootState } from "@/app/store/store";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();

  const conversationId = params.id as string;

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pallySending, setPallySending] = useState(false);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [friend, setFriend] = useState<ConnectionFriend | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [showRelationshipSettings, setShowRelationshipSettings] =
    useState(false);
  const [imageError, setImageError] = useState(false);

  const [currentPetId, setCurrentPetId] = useState<string | null>(null);

  const websocketRef = useRef<WebSocket | null>(null);

  // -----------------------------------------------------------------
  // WebSocket + Conversation + Message History
  // -----------------------------------------------------------------

  useEffect(() => {
    if (!conversationId || !accessToken || !currentUser) {
      return;
    }

    // ---------------------------------------------------------------
    // Create stable non-null values.
    //
    // TypeScript now knows these are definitely strings and they can
    // safely be used inside initializeChat().
    // ---------------------------------------------------------------

    const currentUserId = currentUser.id;
    const token = accessToken;

    let isActive = true;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError("Unable to connect to chat.");
      setLoading(false);
      return;
    }

    const baseApiUrl = apiUrl;

    // -----------------------------------------------------------------
    // Initialize chat
    // -----------------------------------------------------------------

    async function initializeChat() {
      try {
        setLoading(true);
        setError("");

        // -------------------------------------------------------------
        // Load everything required before opening WebSocket.
        //
        // Most importantly, get the current user's Pally first.
        // -------------------------------------------------------------

        const [conversation, connections, pet, messageHistory] =
          await Promise.all([
            getConversation(conversationId),
            getConnections(),
            getPet().catch(() => null),
            getMessages(conversationId),
          ]);

        if (!isActive) {
          return;
        }

        // -------------------------------------------------------------
        // Current user's Pally
        // -------------------------------------------------------------

        if (pet) {
          setCurrentPetId(pet.id);

          console.log("[CHAT] Current Pally:", {
            id: pet.id,
            name: pet.name,
          });
        } else {
          console.log("[CHAT] Current user has no Pally");
        }

        // -------------------------------------------------------------
        // Find friend
        // -------------------------------------------------------------

        const friendId = conversation.participant_ids.find(
          (participantId) => participantId !== currentUserId,
        );

        if (!friendId) {
          setError("Unable to identify this conversation.");
          return;
        }

        const connection = connections.find(
          (item) => item.friend?.id === friendId,
        );

        if (connection) {
          setConnection(connection);

          if (connection.friend) {
            setFriend(connection.friend);
            setImageError(false);
          }
        }

        // -------------------------------------------------------------
        // Load historical messages
        // -------------------------------------------------------------

        setMessages(
          [...messageHistory].sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          ),
        );

        // -------------------------------------------------------------
        // Open WebSocket only AFTER current Pally is loaded.
        // -------------------------------------------------------------

        const websocketUrl = baseApiUrl
          .replace(/^http:/, "ws:")
          .replace(/^https:/, "wss:");

        const websocket = new WebSocket(
          `${websocketUrl}/ws/conversations/${conversationId}?token=${encodeURIComponent(
            token,
          )}`,
        );

        websocketRef.current = websocket;

        // -------------------------------------------------------------
        // WebSocket Open
        // -------------------------------------------------------------

        websocket.onopen = () => {
          if (!isActive || websocketRef.current !== websocket) {
            return;
          }

          console.log("[CHAT] WebSocket connected");

          setIsConnected(true);
          setError("");
        };

        // -------------------------------------------------------------
        // WebSocket Message
        // -------------------------------------------------------------

        websocket.onmessage = (event) => {
          if (!isActive || websocketRef.current !== websocket) {
            return;
          }

          try {
            const data = JSON.parse(event.data);

            // -------------------------------------------------------------
            // Pally autonomous conversation started
            // -------------------------------------------------------------

            if (data.type === "pally_started") {
              console.log("[CHAT] Pally conversation started");

              setPallySending(true);
              setError("");

              return;
            }

            // -------------------------------------------------------------
            // Pally autonomous conversation finished
            // -------------------------------------------------------------

            if (data.type === "pally_finished") {
              console.log("[CHAT] Pally conversation finished");

              setPallySending(false);

              return;
            }

            // -------------------------------------------------------------
            // Pally generation error
            // -------------------------------------------------------------

            if (data.type === "pally_error") {
              console.error("[CHAT] Pally error:", data.message);

              setPallySending(false);
              setError(data.message || "Unable to generate Pally response.");

              return;
            }

            // -------------------------------------------------------------
            // Normal message event
            // -------------------------------------------------------------

            if (data.type !== "message" || !data.message) {
              return;
            }

            const incomingMessage = data.message as Message;

            console.log("[CHAT] Incoming message:", {
              senderType: incomingMessage.sender_type,
              senderId: incomingMessage.sender_id,
              currentPetId: pet?.id ?? null,
              currentUserId,
            });

            // -------------------------------------------------------------
            // IMPORTANT:
            //
            // Do not stop Pally sending state when a Pally message arrives.
            // The backend controls the complete lifecycle:
            //
            // pally_started
            //      ↓
            // message
            //      ↓
            // message
            //      ↓
            // message
            //      ↓
            // pally_finished
            //
            // Therefore setPallySending(false) is handled only by
            // pally_finished or pally_error.
            // -------------------------------------------------------------

            // -------------------------------------------------------------
            // Add message to UI
            // -------------------------------------------------------------

            setMessages((previousMessages) => {
              const alreadyExists = previousMessages.some(
                (message) => message.id === incomingMessage.id,
              );

              if (alreadyExists) {
                return previousMessages;
              }

              return [...previousMessages, incomingMessage].sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime(),
              );
            });
          } catch (err) {
            console.error("Failed to process WebSocket message:", err);
          }
        };

        // -------------------------------------------------------------
        // WebSocket Error
        // -------------------------------------------------------------

        websocket.onerror = (event) => {
          if (!isActive || websocketRef.current !== websocket) {
            return;
          }

          console.error("[CHAT] WebSocket error:", event);

          setIsConnected(false);
          setPallySending(false);

          setError("Real-time connection is not available.");
        };

        // -------------------------------------------------------------
        // WebSocket Close
        // -------------------------------------------------------------

        websocket.onclose = (event) => {
          console.log("[CHAT] WebSocket disconnected:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
          });

          if (!isActive || websocketRef.current !== websocket) {
            return;
          }

          websocketRef.current = null;

          setIsConnected(false);
          setPallySending(false);
        };
      } catch (err) {
        console.error("[CHAT] Failed to initialize chat:", err);

        if (isActive) {
          setError("Unable to load this conversation.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    initializeChat();

    // -----------------------------------------------------------------
    // Cleanup
    // -----------------------------------------------------------------

    return () => {
      isActive = false;

      console.log("[CHAT] Closing WebSocket");

      const websocket = websocketRef.current;

      websocketRef.current = null;

      setIsConnected(false);
      setPallySending(false);

      if (websocket) {
        websocket.close();
      }
    };
  }, [conversationId, accessToken, currentUser]);

  // -----------------------------------------------------------------
  // Send User Message
  // -----------------------------------------------------------------

  function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = messageText.trim();

    if (!content || sending || !isConnected) {
      return;
    }

    const websocket = websocketRef.current;

    if (!websocket || websocket.readyState !== WebSocket.OPEN) {
      setError("Real-time connection is not available.");

      return;
    }

    try {
      setSending(true);

      websocket.send(
        JSON.stringify({
          type: "message",
          content,
        }),
      );

      setMessageText("");
    } catch (err) {
      console.error("Failed to send WebSocket message:", err);

      setError("Unable to send your message.");
    } finally {
      setSending(false);
    }
  }

  // -----------------------------------------------------------------
  // Test Pally / Gemini
  // -----------------------------------------------------------------

  function handlePallyMessage() {
    if (pallySending || !isConnected) {
      return;
    }

    const websocket = websocketRef.current;

    if (!websocket || websocket.readyState !== WebSocket.OPEN) {
      setError("Real-time connection is not available.");

      return;
    }

    try {
      setPallySending(true);
      setError("");

      websocket.send(
        JSON.stringify({
          type: "pally_message",
        }),
      );
    } catch (err) {
      console.error("Failed to request Pally response:", err);

      setError("Unable to generate Pally response.");

      setPallySending(false);
    }
  }

  // -----------------------------------------------------------------
  // Friend Display Helpers
  // -----------------------------------------------------------------

  const friendDisplayName = friend?.name || friend?.username || "Friend";

  const friendInitial = getInitial(friendDisplayName);

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------

  return (
    <main className="h-screen overflow-hidden bg-[#fffdfb] text-[#202733] lg:h-screen">
      <div className="relative flex h-full min-h-0 w-full flex-col">
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

        <div className="relative z-10 flex h-full min-h-0 flex-col">
          {/* =======================================================
              Header
          ======================================================== */}

          <header className="flex shrink-0 items-center justify-between border-b border-[#eee8e3] bg-white/85 px-5 py-4 backdrop-blur-md sm:px-8 lg:px-10">
            <div className="flex items-center gap-4">
              {/* Back */}

              <button
                type="button"
                onClick={() => router.push("/chats")}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#697485] transition hover:bg-[#fff5ed] hover:text-[#202733]"
                aria-label="Back to conversations"
              >
                <ArrowLeftIcon />
              </button>

              {/* Friend avatar */}

              {friend?.picture && !imageError ? (
                <img
                  src={friend.picture}
                  alt={friendDisplayName}
                  onError={() => setImageError(true)}
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
                  {isConnected ? "Online" : "Connecting..."}
                </p>
              </div>
            </div>

            {/* Profile */}

            {/* Header actions */}

            <div className="flex items-center gap-2">
              {/* Relationship settings */}

              <button
                type="button"
                onClick={() => setShowRelationshipSettings(true)}
                disabled={!connection}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#697485] transition hover:bg-[#fff5ed] hover:text-[#202733] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Relationship settings"
                title="Pally relationship settings"
              >
                <SettingsIcon />
              </button>

              {/* Profile */}

              <Link
                href="/profile"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b5cc9d] text-[15px] font-medium text-white"
              >
                {getInitial(currentUser?.name)}
              </Link>
            </div>
          </header>

          {/* =======================================================
              Messages
          ======================================================== */}

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 lg:px-10">
              <div className="mx-auto flex w-full max-w-[850px] flex-col gap-3">
                {/* Loading */}

                {loading && (
                  <div className="flex flex-1 items-center justify-center py-20">
                    <p className="text-[16px] text-[#8993a2]">
                      Loading messages...
                    </p>
                  </div>
                )}

                {/* Error */}

                {!loading && error && (
                  <div className="flex flex-1 items-center justify-center py-20">
                    <div className="text-center">
                      <div className="text-[45px]">🐾</div>

                      <p className="mt-3 text-[16px] text-[#8993a2]">{error}</p>
                    </div>
                  </div>
                )}

                {/* Empty conversation */}

                {!loading && !error && messages.length === 0 && (
                  <div className="flex flex-1 items-center justify-center py-24">
                    <div className="text-center">
                      <div className="text-[55px]">🐾</div>

                      <h2 className="mt-4 text-[23px] font-semibold text-[#202733]">
                        Start a conversation
                      </h2>

                      <p className="mt-2 text-[15px] text-[#8993a2]">
                        Say hello and start chatting.
                      </p>
                    </div>
                  </div>
                )}

                {/* Messages */}

                {!loading &&
                  !error &&
                  messages.map((message) => {
                    const isPet = message.sender_type === "pet";

                    // -------------------------------------------------
                    // Normal user message
                    // -------------------------------------------------

                    const isMyUserMessage =
                      message.sender_type === "user" &&
                      message.sender_id === currentUser?.id;

                    // -------------------------------------------------
                    // Current user's Pally message
                    // -------------------------------------------------

                    const isMyPetMessage =
                      message.sender_type === "pet" &&
                      message.sender_id === currentPetId;

                    // -------------------------------------------------
                    // Anything generated by my Pally should appear
                    // on my side.
                    // -------------------------------------------------

                    const isMine = isMyUserMessage || isMyPetMessage;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isMine ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex max-w-[75%] items-end gap-2 ${
                            isMine ? "flex-row-reverse" : "flex-row"
                          }`}
                        >
                          {/* -------------------------------------------------
                                Pally avatar
                            ------------------------------------------------- */}

                          {isPet && (
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dbe9ce] text-[16px]">
                              🐾
                            </div>
                          )}

                          {/* -------------------------------------------------
                                Message bubble
                            ------------------------------------------------- */}

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
              <div className="mx-auto flex w-full max-w-[850px] flex-col gap-3">
                {/* Temporary Pally test */}

                <div className="flex items-center justify-between">
                  <p className="text-[12px] text-[#9aa2ad]">Test Pally</p>

                  <button
                    type="button"
                    onClick={handlePallyMessage}
                    disabled={pallySending || !isConnected}
                    className="rounded-full bg-[#dbe9ce] px-4 py-2 text-[13px] font-medium text-[#5d7350] transition hover:bg-[#cfe5b7] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pallySending ? "Pally is thinking..." : "Ask Pally 🐾"}
                  </button>
                </div>

                {/* Normal chat input */}

                <form
                  onSubmit={handleSendMessage}
                  className="flex w-full items-center gap-3"
                >
                  <input
                    type="text"
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    placeholder={
                      isConnected ? "Write a message..." : "Connecting..."
                    }
                    disabled={sending || !isConnected}
                    className="min-w-0 flex-1 rounded-full border border-[#e3e0dd] bg-[#fffdfb] px-5 py-3.5 text-[15px] text-[#202733] outline-none transition placeholder:text-[#a2aab5] focus:border-[#b5cc9d] focus:ring-2 focus:ring-[#dbe9ce]"
                  />

                  <button
                    type="submit"
                    disabled={sending || !messageText.trim() || !isConnected}
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
        {/* =======================================================
            Relationship Settings
        ======================================================== */}

        {showRelationshipSettings && connection && (
          <RelationshipSettings
            connectionId={connection.id}
            preferences={connection.relationship_preferences}
            onSaved={(updatedPreferences) => {
              setConnection((previous) =>
                previous
                  ? {
                      ...previous,
                      relationship_preferences: updatedPreferences,
                    }
                  : previous,
              );
            }}
            onClose={() => setShowRelationshipSettings(false)}
          />
        )}
      </div>
    </main>
  );
}

// ===============================================================
// Helpers
// ===============================================================

function getInitial(value?: string | null): string {
  if (!value) {
    return "?";
  }

  return value.trim().charAt(0).toUpperCase();
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
// Settings icon
// ===============================================================

function SettingsIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.9 1.9-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20h-2.7v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.9-1.9.06-.06A1.7 1.7 0 0 0 7.6 15a1.7 1.7 0 0 0-1.56-1.04H5.9v-2.7h.14A1.7 1.7 0 0 0 7.6 10a1.7 1.7 0 0 0-.34-1.88L7.2 8.06l1.9-1.9.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.04-1.56V4.9h2.7v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.9 1.9-.06.06A1.7 1.7 0 0 0 19.4 10a1.7 1.7 0 0 0 1.56 1.04h.14v2.7h-.14A1.7 1.7 0 0 0 19.4 15Z" />
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
      <path d="m22 2-7 20-9-4-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
