"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";

import { getPet } from "@/app/lib/api/petApi";

import type { Pet } from "@/app/types/pet";
import type { RootState } from "@/app/store/store";

export default function ProfilePage() {
  const currentUser = useSelector(
    (state: RootState) => state.auth.user
  );

  const [pet, setPet] = useState<Pet | null>(null);
  const [loadingPet, setLoadingPet] = useState(true);

  useEffect(() => {
    async function loadPet() {
      try {
        const currentPet = await getPet();
        setPet(currentPet);
      } catch {
        setPet(null);
      } finally {
        setLoadingPet(false);
      }
    }

    loadPet();
  }, []);

  const displayName = currentUser?.name || "Pally User";
  const email = currentUser?.email || "";
  const initial = getInitial(displayName);

  return (
    <main className="h-screen overflow-hidden bg-[#fffdfb] text-[#202733]">
      <div className="relative h-full overflow-hidden">

        {/* =========================================================
            Background decoration
        ========================================================== */}

        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-72 w-[600px] rounded-[50%] bg-[#ffe7d2] opacity-55" />

          <div className="absolute -right-48 -top-48 h-80 w-[700px] rotate-[-8deg] rounded-[50%] bg-[#dbe9ce] opacity-55" />

          <div className="absolute -bottom-48 -left-40 h-80 w-[700px] rotate-[8deg] rounded-[50%] bg-[#dbe9ce] opacity-60" />

          <div className="absolute -bottom-40 -right-48 h-72 w-[620px] rounded-[50%] bg-[#ffe9d7] opacity-60" />
        </div>

        {/* =========================================================
            Page
        ========================================================== */}

        <div className="relative z-10 flex h-full min-h-0 flex-col">

          {/* =======================================================
              Header
          ======================================================== */}

          <header className="flex shrink-0 items-center justify-between border-b border-[#eee8e3] bg-white/85 px-5 py-5 backdrop-blur-md sm:px-8 lg:px-10">
            <div>
              <p className="text-[13px] font-medium text-[#8a94a3]">
                Your space
              </p>

              <h1 className="mt-0.5 text-[25px] font-semibold tracking-[-0.5px] text-[#202733]">
                Profile
              </h1>
            </div>

            <Link
              href="/chats"
              className="flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium text-[#596373] transition hover:bg-[#fff0e3] hover:text-[#202733]"
            >
              <ArrowLeftIcon />
              <span>Back to chats</span>
            </Link>
          </header>

          {/* =======================================================
              Scrollable content
          ======================================================== */}

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8 lg:px-10">
            <div className="mx-auto w-full max-w-[900px]">

              {/* =================================================
                  Profile Hero
              ================================================== */}

              <section className="relative overflow-hidden rounded-[30px] border border-[#eee8e3] bg-white/90 p-6 shadow-[0_10px_35px_rgba(32,39,51,0.06)] backdrop-blur-md sm:p-8">

                {/* Decorative paw */}

                <div className="pointer-events-none absolute -right-4 -top-8 rotate-12 text-[110px] opacity-[0.06]">
                  🐾
                </div>

                <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">

                  {/* Avatar */}

                  {currentUser?.picture ? (
                    <img
                      src={currentUser.picture}
                      alt={displayName}
                      className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-[#fff0e3]"
                    />
                  ) : (
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#dbe9ce] text-[34px] font-semibold text-[#5d7350] ring-4 ring-[#fff0e3]">
                      {initial}
                    </div>
                  )}

                  {/* User information */}

                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#8a94a3]">
                      Pally member
                    </p>

                    <h2 className="mt-1 text-[28px] font-semibold tracking-[-0.7px] text-[#202733]">
                      {displayName}
                    </h2>

                    {email && (
                      <p className="mt-1 text-[15px] text-[#8a94a3]">
                        {email}
                      </p>
                    )}

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fff0e3] px-3.5 py-2 text-[12px] font-medium text-[#8a654b]">
                      <span>🐾</span>
                      <span>Making friendships brighter</span>
                    </div>
                  </div>
                </div>
              </section>


              {/* =================================================
                  Main grid
              ================================================== */}

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">

                {/* =================================================
                    Pally Card
                ================================================== */}

                <section className="rounded-[30px] border border-[#e5eadf] bg-[#f4f8ef]/95 p-6 shadow-[0_8px_30px_rgba(32,39,51,0.05)] sm:p-7">

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[1.4px] text-[#789066]">
                        My Pally
                      </p>

                      <h2 className="mt-2 text-[23px] font-semibold text-[#202733]">
                        {loadingPet
                          ? "Your little companion"
                          : pet
                            ? pet.name
                            : "Create your Pally"}
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[25px] shadow-sm">
                      🐾
                    </div>
                  </div>


                  {loadingPet ? (
                    <div className="mt-7">
                      <div className="h-3 w-32 animate-pulse rounded-full bg-[#dbe9ce]" />
                      <div className="mt-3 h-3 w-48 animate-pulse rounded-full bg-[#e6edde]" />
                    </div>
                  ) : pet ? (
                    <>
                      {/* Personality */}

                      <div className="mt-7">
                        <p className="text-[13px] font-medium text-[#7c8874]">
                          Personality
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {pet.personality.length > 0 ? (
                            pet.personality.map((item) => (
                              <Tag
                                key={`personality-${item}`}
                                label={item}
                              />
                            ))
                          ) : (
                            <span className="text-[13px] text-[#9aa3af]">
                              Not set yet
                            </span>
                          )}
                        </div>
                      </div>


                      {/* Humor */}

                      <div className="mt-5">
                        <p className="text-[13px] font-medium text-[#7c8874]">
                          Humor
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {pet.humor.length > 0 ? (
                            pet.humor.map((item) => (
                              <Tag
                                key={`humor-${item}`}
                                label={item}
                              />
                            ))
                          ) : (
                            <span className="text-[13px] text-[#9aa3af]">
                              Not set yet
                            </span>
                          )}
                        </div>
                      </div>


                      {/* Interests */}

                      <div className="mt-5">
                        <p className="text-[13px] font-medium text-[#7c8874]">
                          Interests
                        </p>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {pet.interests.length > 0 ? (
                            pet.interests.map((item) => (
                              <Tag
                                key={`interest-${item}`}
                                label={item}
                              />
                            ))
                          ) : (
                            <span className="text-[13px] text-[#9aa3af]">
                              Not set yet
                            </span>
                          )}
                        </div>
                      </div>


                      {/* Action */}

                      <Link
                        href="/bot"
                        className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#75ad55] px-5 py-3 text-[13px] font-medium text-white shadow-[0_5px_15px_rgba(117,173,85,0.18)] transition hover:bg-[#68a14b]"
                      >
                        Manage My Pally
                        <ArrowRightIcon />
                      </Link>
                    </>
                  ) : (
                    <div className="mt-6 rounded-2xl bg-white/80 p-5">
                      <p className="text-[14px] leading-[1.5] text-[#7d8795]">
                        You haven't created your little companion yet.
                        Give your Pally a personality and let it help
                        make your friendships more fun.
                      </p>

                      <Link
                        href="/bot"
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#202733] px-5 py-3 text-[13px] font-medium text-white transition hover:bg-[#303846]"
                      >
                        Create My Pally
                        <ArrowRightIcon />
                      </Link>
                    </div>
                  )}
                </section>


                {/* =================================================
                    Account Card
                ================================================== */}

                <section className="rounded-[30px] border border-[#eee8e3] bg-white/90 p-6 shadow-[0_8px_30px_rgba(32,39,51,0.05)] sm:p-7">

                  <p className="text-[12px] font-semibold uppercase tracking-[1.4px] text-[#a08b78]">
                    Account
                  </p>

                  <h2 className="mt-2 text-[23px] font-semibold text-[#202733]">
                    Your details
                  </h2>

                  <div className="mt-7 space-y-5">

                    <ProfileDetail
                      label="Name"
                      value={displayName}
                    />

                    <ProfileDetail
                      label="Email"
                      value={email || "Not available"}
                    />

                    <ProfileDetail
                      label="Sign in"
                      value="Google"
                    />

                  </div>


                  <div className="mt-7 rounded-2xl bg-[#fff7f0] px-4 py-4">
                    <div className="flex gap-3">
                      <div className="mt-0.5 text-[20px]">
                        💛
                      </div>

                      <div>
                        <p className="text-[13px] font-medium text-[#5f5146]">
                          Your Pally is part of the experience
                        </p>

                        <p className="mt-1 text-[12px] leading-[1.5] text-[#95877a]">
                          Pally is here to help people connect,
                          not replace the friendship itself.
                        </p>
                      </div>
                    </div>
                  </div>

                </section>
              </div>


              {/* =================================================
                  Bottom message
              ================================================== */}

              <div className="py-10 text-center">
                <div className="text-[28px]">
                  🐾
                </div>

                <p className="mt-2 text-[14px] font-medium text-[#7f8997]">
                  Little pets. Brighter friendships.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


/* ===============================================================
   Profile Detail
================================================================ */

function ProfileDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-[#f0ece8] pb-4 last:border-0 last:pb-0">
      <p className="text-[12px] font-medium text-[#9aa2ad]">
        {label}
      </p>

      <p className="mt-1 text-[15px] font-medium text-[#303846]">
        {value}
      </p>
    </div>
  );
}


/* ===============================================================
   Tag
================================================================ */

function Tag({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-[#65745c] shadow-[0_1px_4px_rgba(32,39,51,0.04)]">
      {label}
    </span>
  );
}


/* ===============================================================
   Helpers
================================================================ */

function getInitial(value?: string | null): string {
  if (!value) {
    return "?";
  }

  return value.trim().charAt(0).toUpperCase();
}


/* ===============================================================
   Arrow Left Icon
================================================================ */

function ArrowLeftIcon() {
  return (
    <svg
      width="17"
      height="17"
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


/* ===============================================================
   Arrow Right Icon
================================================================ */

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}