"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { getConnections } from "@/app/lib/api/connectionApi";
import { getOrCreateConversation } from "@/app/lib/api/conversationApi";
import type { Connection } from "@/app/types/connection";
import type { RootState } from "@/app/store/store";

export default function ChatsPage() {
  const router = useRouter();

  const currentUser = useSelector((state: RootState) => state.auth.user);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openingFriendId, setOpeningFriendId] = useState<string | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadConnections() {
      try {
        setLoading(true);
        setError("");

        const data = await getConnections();

        setConnections(data);
      } catch (err) {
        console.error("Failed to load connections:", err);
        setError("Unable to load your friends.");
      } finally {
        setLoading(false);
      }
    }

    loadConnections();
  }, []);

  const friends = connections.filter(
    (connection) => connection.status === "accepted",
  );

  async function handleFriendClick(friendId: string) {
    try {
      setOpeningFriendId(friendId);

      const conversation = await getOrCreateConversation(friendId);

      router.push(`/chats/${conversation.id}`);
    } catch (err) {
      console.error("Failed to open conversation:", err);
      setError("Unable to open this conversation.");
      setOpeningFriendId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#fffdfb] text-[#202733] lg:h-screen lg:overflow-hidden">
      <div className="relative flex min-h-screen w-full lg:h-screen lg:min-h-0">
        {/* =========================================================
            Background decoration
        ========================================================== */}

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          {/* Left peach */}
          <div className="absolute -bottom-32 -left-40 h-64 w-[560px] rounded-[50%] bg-[#ffe7d2] sm:h-80 sm:w-[700px]" />

          {/* Left green */}
          <div className="absolute -bottom-48 -left-48 h-72 w-[760px] rotate-[10deg] rounded-[50%] bg-[#cfe5b7] sm:h-96 sm:w-[900px]" />

          {/* Right peach */}
          <div className="absolute -bottom-32 -right-40 h-64 w-[560px] rounded-[50%] bg-[#ffe9d7] sm:h-80 sm:w-[700px]" />

          {/* Right green */}
          <div className="absolute -bottom-48 -right-48 h-72 w-[760px] -rotate-[10deg] rounded-[50%] bg-[#cfe5b7] sm:h-96 sm:w-[900px]" />

          {/* Small circles */}
          <div className="absolute bottom-[-10px] left-[25%] h-28 w-28 rounded-full bg-[#fff0e3] opacity-80" />

          <div className="absolute bottom-[-10px] right-[20%] h-28 w-28 rounded-full bg-[#fff0e3] opacity-80" />
        </div>

        {/* =========================================================
            Main content
        ========================================================== */}

        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          {/* =======================================================
              Mobile / tablet header
          ======================================================== */}

          <header className="flex items-center justify-between px-5 py-5 lg:hidden">
            <Link href="/chats" className="flex items-center">
              <span className="text-[30px] font-bold tracking-[-1.5px]">
                Pally
              </span>

              <span className="ml-1 -mt-1 text-[27px]">🐾</span>
            </Link>

            <Link
              href="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#b5cc9d] text-[16px] font-medium text-white"
            >
              {getInitial(currentUser?.name)}
            </Link>
          </header>

          {/* =======================================================
              Desktop top bar
          ======================================================== */}

          <header className="hidden items-center justify-end px-10 py-6 xl:px-14 lg:flex">
            <Link
              href="/profile"
              className="flex items-center gap-3 rounded-full px-2 py-1.5 transition hover:bg-[#fff5ed]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b5cc9d] text-[17px] font-medium text-white">
                {getInitial(currentUser?.name)}
              </div>

              <span className="text-[17px] font-medium text-[#303846]">
                {currentUser?.name || "Profile"}
              </span>

              <ChevronDownIcon />
            </Link>
          </header>

          {/* =======================================================
              Content
          ======================================================== */}

          <section className="flex flex-1 flex-col px-5 pb-24 sm:px-8 lg:px-10 lg:pb-8 xl:px-14">
            {/* Page heading */}

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-[34px] font-semibold tracking-[-1.5px] text-[#202733] sm:text-[42px] lg:text-[46px]">
                  Your conversations
                </h1>

                <p className="mt-2 text-[17px] text-[#7c8798] sm:text-[20px]">
                  Where little pets make big connections.
                </p>
              </div>

              {/* Search */}

              <div className="hidden w-[310px] items-center gap-3 rounded-full border border-[#e3e0dd] bg-white/80 px-5 py-3.5 text-[#9aa3b1] shadow-[0_2px_10px_rgba(32,39,51,0.03)] xl:flex">
                <SearchIcon />

                <span className="text-[15px]">Search conversations...</span>
              </div>
            </div>

            {/* =====================================================
                Loading
            ====================================================== */}

            {loading && (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-[17px] text-[#7c8798]">
                  Loading your friends...
                </div>
              </div>
            )}

            {/* =====================================================
                Error
            ====================================================== */}

            {!loading && error && (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  <div className="text-[45px]">🐾</div>

                  <p className="mt-3 text-[17px] text-[#7c8798]">{error}</p>
                </div>
              </div>
            )}

            {/* =====================================================
                Friends / Chat list
            ====================================================== */}

            {!loading && !error && friends.length > 0 && (
              <div className="mt-8 flex-1 overflow-y-auto pb-4">
                <div className="w-full max-w-[900px]">
                  {friends.map((connection) => {
                    const friend = connection.friend;
                    const isOpening = openingFriendId === friend.id;

                    return (
                      <button
                        key={connection.id}
                        type="button"
                        onClick={() => handleFriendClick(friend.id)}
                        disabled={openingFriendId !== null}
                        className="mb-3 flex w-full items-center gap-4 rounded-2xl border border-[#ebe6e1] bg-white/90 px-5 py-4 text-left shadow-[0_2px_10px_rgba(32,39,51,0.03)] transition hover:-translate-y-[1px] hover:bg-white hover:shadow-[0_6px_18px_rgba(32,39,51,0.07)] disabled:cursor-wait disabled:opacity-70"
                      >
                        {/* Friend avatar */}

                        {friend.picture && !failedImageIds.has(friend.id) ? (
                          <img
                            src={friend.picture}
                            alt={friend.name || friend.username}
                            onError={() => {
                              setFailedImageIds((previous) => {
                                const next = new Set(previous);
                                next.add(friend.id);
                                return next;
                              });
                            }}
                            className="h-14 w-14 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#dbe9ce] text-[23px]">
                            {getInitial(friend.name || friend.username)}
                          </div>
                        )}

                        {/* Friend information */}

                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-[17px] font-semibold text-[#202733]">
                            {friend.name || friend.username}
                          </h2>

                          <p className="mt-1 truncate text-[14px] text-[#8a94a3]">
                            @{friend.username}
                          </p>
                        </div>

                        {/* Arrow / loading */}

                        <div className="shrink-0 text-[24px] text-[#b2bdab]">
                          {isOpening ? "..." : "›"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =====================================================
                Empty state
            ====================================================== */}

            {!loading && !error && friends.length === 0 && (
              <div className="flex flex-1 items-center justify-center">
                <div className="flex w-full max-w-[620px] flex-col items-center text-center">
                  {/* Puppy */}

                  <div className="relative mt-5 h-[190px] w-[330px] sm:h-[220px] sm:w-[390px]">
                    {/* Shadow */}

                    <div className="absolute bottom-2 left-1/2 h-5 w-[260px] -translate-x-1/2 rounded-full bg-[#eadfd2] opacity-40 blur-md" />

                    {/* Sprout */}

                    <div className="absolute left-1/2 top-0 -translate-x-1/2">
                      <div className="relative h-[65px] w-[55px]">
                        <div className="absolute left-1/2 top-[27px] h-[42px] w-[5px] -translate-x-1/2 rotate-[10deg] rounded-full bg-[#7da64d]" />

                        <div className="absolute left-[8px] top-[2px] h-[30px] w-[19px] -rotate-[28deg] rounded-[100%_0_100%_0] bg-[#8dbd57]" />

                        <div className="absolute right-[4px] top-[19px] h-[25px] w-[21px] rotate-[35deg] rounded-[0_100%_0_100%] bg-[#8dbd57]" />
                      </div>
                    </div>

                    {/* Puppy */}

                    <div className="absolute bottom-[20px] left-1/2 h-[145px] w-[230px] -translate-x-1/2 rounded-[46%_46%_22%_22%] bg-gradient-to-b from-[#fffaf0] to-[#f5ead9] shadow-[0_15px_30px_rgba(180,155,130,0.10)] sm:h-[165px] sm:w-[260px]">
                      {/* Ears */}

                      <div className="absolute -left-[34px] top-[20px] h-[95px] w-[58px] rotate-[27deg] rounded-[55%_45%_45%_55%] bg-[#825136] sm:-left-[40px] sm:h-[110px] sm:w-[65px]" />

                      <div className="absolute -right-[34px] top-[20px] h-[95px] w-[58px] -rotate-[27deg] rounded-[45%_55%_55%_45%] bg-[#825136] sm:-right-[40px] sm:h-[110px] sm:w-[65px]" />

                      {/* Brows */}

                      <div className="absolute left-[55px] top-[45px] h-[4px] w-[20px] rotate-[-10deg] rounded-full bg-[#e8d9c7]" />

                      <div className="absolute right-[55px] top-[45px] h-[4px] w-[20px] rotate-[10deg] rounded-full bg-[#e8d9c7]" />

                      {/* Blush */}

                      <div className="absolute left-[35px] top-[65px] h-[28px] w-[32px] rounded-full bg-[#f5aaa3] opacity-70 blur-[8px]" />

                      <div className="absolute right-[35px] top-[65px] h-[28px] w-[32px] rounded-full bg-[#f5aaa3] opacity-70 blur-[8px]" />

                      {/* Eyes */}

                      <div className="absolute left-[54px] top-[58px] h-[18px] w-[36px] rounded-t-full border-t-[5px] border-[#202733]" />

                      <div className="absolute right-[54px] top-[58px] h-[18px] w-[36px] rounded-t-full border-t-[5px] border-[#202733]" />

                      {/* Nose */}

                      <div className="absolute left-1/2 top-[77px] h-[12px] w-[20px] -translate-x-1/2 rounded-full bg-[#292a2c]" />

                      {/* Smile */}

                      <div className="absolute left-1/2 top-[86px] h-[30px] w-[54px] -translate-x-1/2">
                        <div className="absolute left-1/2 top-0 h-[17px] w-[27px] -translate-x-1/2 rounded-b-full border-b-[5px] border-[#292a2c]" />

                        <div className="absolute left-[5px] top-[4px] h-[19px] w-[19px] rounded-bl-full border-b-[5px] border-l-[5px] border-[#292a2c]" />

                        <div className="absolute right-[5px] top-[4px] h-[19px] w-[19px] rounded-br-full border-b-[5px] border-r-[5px] border-[#292a2c]" />
                      </div>

                      {/* Paws */}

                      <div className="absolute -bottom-[8px] left-[18px] h-[43px] w-[58px] rounded-full bg-[#fffaf0]" />

                      <div className="absolute -bottom-[8px] right-[18px] h-[43px] w-[58px] rounded-full bg-[#fffaf0]" />
                    </div>

                    {/* Heart */}

                    <div className="absolute right-[5%] top-[20px] flex h-[72px] w-[85px] items-center justify-center rounded-[50%] bg-[#fff7ef] sm:right-[7%]">
                      <span className="text-[28px] text-[#f58483]">♥</span>

                      <div className="absolute bottom-[0] left-[7px] h-0 w-0 rotate-[12deg] border-l-[15px] border-t-[10px] border-l-transparent border-t-[#fff7ef]" />
                    </div>
                  </div>

                  {/* Empty state text */}

                  <h2 className="mt-2 text-[27px] font-semibold tracking-[-0.8px] text-[#202733] sm:text-[32px]">
                    No conversations yet
                  </h2>

                  <p className="mt-3 max-w-[470px] text-[16px] leading-[1.55] text-[#7c8798] sm:text-[19px]">
                    Your Pally is excited to meet new friends!
                    <br className="hidden sm:block" />
                    Add a friend to start a conversation.
                  </p>

                  <Link
                    href="/profile"
                    className="mt-7 flex h-[58px] items-center gap-3 rounded-full bg-[#75ad55] px-8 text-[17px] font-medium text-white shadow-[0_7px_18px_rgba(117,173,85,0.20)] transition hover:bg-[#68a14b] hover:shadow-[0_9px_22px_rgba(117,173,85,0.25)] active:scale-[0.98]"
                  >
                    <span className="text-[28px] font-light leading-none">
                      +
                    </span>
                    Add a friend
                  </Link>
                </div>
              </div>
            )}

            {/* Desktop quote */}

            <div className="hidden shrink-0 text-center lg:block">
              <p className="font-serif text-[18px] italic leading-[1.35] text-[#ad9890]">
                “Same friends.
                <br />
                New conversations.”
              </p>

              <div className="mt-2 text-[18px] opacity-70">🐾</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ===============================================================
   Helpers
=============================================================== */

function getInitial(value?: string | null): string {
  if (!value) {
    return "?";
  }

  return value.trim().charAt(0).toUpperCase();
}

/* ===============================================================
   Search icon
=============================================================== */

function SearchIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

/* ===============================================================
   Chevron down icon
=============================================================== */

function ChevronDownIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6-6-6" />
    </svg>
  );
}
