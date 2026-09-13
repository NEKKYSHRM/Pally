"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { getUser, updateUserProfile } from "@/app/lib/api/userApi";

import type { RootState } from "@/app/store/store";

type ProfileData = {
  id?: string;
  name: string;
  email: string;
  picture: string | null;
  date_of_birth: string;
  gender: string;
  profession: string;
};

export default function ProfilePage() {
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [profile, setProfile] = useState<ProfileData>({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    picture: currentUser?.picture ?? null,
    date_of_birth: "",
    gender: "",
    profession: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setProfile((previous) => ({
      ...previous,
      id: currentUser.id,
      name: currentUser.name || "",
      email: currentUser.email || "",
      picture: currentUser.picture ?? null,
    }));
  }, [currentUser]);

  useEffect(() => {
    async function loadProfile() {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUser();

        setProfile({
          id: data.id,
          name: data.name || "",
          email: data.email || "",
          picture: data.picture,
          date_of_birth: data.date_of_birth || "",
          gender: data.gender || "",
          profession: data.profession || "",
        });
      } catch (error) {
        console.error("Failed to load profile:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your profile information.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [accessToken]);

  const displayName = profile.name || "Pally User";
  const email = profile.email || "";
  const initial = getInitial(displayName);

  async function handleSave() {
    if (!accessToken) {
      setErrorMessage("You are not authenticated.");
      return;
    }

    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const updatedProfile = await updateUserProfile({
        date_of_birth: profile.date_of_birth || null,
        gender: profile.gender || null,
        profession: profile.profession || null,
      });

      setProfile((previous) => ({
        ...previous,
        name: updatedProfile.name ?? previous.name,
        email: updatedProfile.email ?? previous.email,
        picture: updatedProfile.picture ?? previous.picture,
        date_of_birth: updatedProfile.date_of_birth ?? previous.date_of_birth,
        gender: updatedProfile.gender ?? previous.gender,
        profession: updatedProfile.profession ?? previous.profession,
      }));

      setSuccessMessage("Your profile has been updated.");
    } catch (error) {
      console.error("Failed to update profile:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

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

                  {profile.picture ? (
                    <img
                      src={profile.picture}
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
                      <p className="mt-1 text-[15px] text-[#8a94a3]">{email}</p>
                    )}

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fff0e3] px-3.5 py-2 text-[12px] font-medium text-[#8a654b]">
                      <span>🐾</span>
                      <span>Making friendships brighter</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  Account Card
              ================================================== */}

              <section className="mt-6 rounded-[30px] border border-[#eee8e3] bg-white/90 p-6 shadow-[0_8px_30px_rgba(32,39,51,0.05)] backdrop-blur-md sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[1.4px] text-[#a08b78]">
                      Account
                    </p>

                    <h2 className="mt-2 text-[23px] font-semibold text-[#202733]">
                      Your details
                    </h2>

                    <p className="mt-1 text-[13px] leading-[1.5] text-[#8a94a3]">
                      Keep your profile information up to date.
                    </p>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e3] text-[22px]">
                    ✨
                  </div>
                </div>

                {loading ? (
                  <div className="mt-8 space-y-5">
                    <div className="h-16 animate-pulse rounded-2xl bg-[#f5f2ef]" />
                    <div className="h-16 animate-pulse rounded-2xl bg-[#f5f2ef]" />
                    <div className="h-16 animate-pulse rounded-2xl bg-[#f5f2ef]" />
                    <div className="h-16 animate-pulse rounded-2xl bg-[#f5f2ef]" />
                  </div>
                ) : (
                  <>
                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                      {/* Name */}

                      <ProfileInput
                        label="Name"
                        value={profile.name}
                        disabled
                      />

                      {/* Email */}

                      <ProfileInput
                        label="Email"
                        value={profile.email}
                        disabled
                      />

                      {/* Date of Birth */}

                      <ProfileInput
                        label="Date of birth"
                        type="date"
                        value={profile.date_of_birth}
                        onChange={(value) =>
                          setProfile((previous) => ({
                            ...previous,
                            date_of_birth: value,
                          }))
                        }
                      />

                      {/* Gender */}

                      <ProfileSelect
                        label="Gender"
                        value={profile.gender}
                        onChange={(value) =>
                          setProfile((previous) => ({
                            ...previous,
                            gender: value,
                          }))
                        }
                        options={[
                          {
                            value: "",
                            label: "Select gender",
                          },
                          {
                            value: "male",
                            label: "Male",
                          },
                          {
                            value: "female",
                            label: "Female",
                          },
                          {
                            value: "non_binary",
                            label: "Non-binary",
                          },
                          {
                            value: "prefer_not_to_say",
                            label: "Prefer not to say",
                          },
                        ]}
                      />

                      {/* Profession */}

                      <div className="sm:col-span-2">
                        <ProfileInput
                          label="Profession"
                          placeholder="e.g. Software Engineer"
                          value={profile.profession}
                          onChange={(value) =>
                            setProfile((previous) => ({
                              ...previous,
                              profession: value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    {/* Messages */}

                    {errorMessage && (
                      <div className="mt-5 rounded-2xl bg-[#fff0f0] px-4 py-3 text-[13px] font-medium text-[#a85c5c]">
                        {errorMessage}
                      </div>
                    )}

                    {successMessage && (
                      <div className="mt-5 rounded-2xl bg-[#eef7e9] px-4 py-3 text-[13px] font-medium text-[#5d7b4e]">
                        {successMessage}
                      </div>
                    )}

                    {/* Save */}

                    <div className="mt-7 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#75ad55] px-6 text-[13px] font-medium text-white shadow-[0_5px_15px_rgba(117,173,85,0.18)] transition hover:bg-[#68a14b] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <SpinnerIcon />
                            Saving...
                          </>
                        ) : (
                          <>
                            Save Changes
                            <CheckIcon />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}

                {/* Google account */}

                <div className="mt-7 rounded-2xl bg-[#fff7f0] px-4 py-4">
                  <div className="flex gap-3">
                    <div className="mt-0.5 text-[20px]">🔐</div>

                    <div>
                      <p className="text-[13px] font-medium text-[#5f5146]">
                        Signed in with Google
                      </p>

                      <p className="mt-1 text-[12px] leading-[1.5] text-[#95877a]">
                        Your name, email and profile picture come from your
                        Google account.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* =================================================
                  Bottom message
              ================================================== */}

              <div className="py-10 text-center">
                <div className="text-[28px]">🐾</div>

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
   Profile Input
================================================================ */

function ProfileInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-[12px] font-medium text-[#8a94a3]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`h-12 w-full rounded-2xl border border-[#eee8e3] px-4 text-[14px] text-[#303846] outline-none transition ${
          disabled
            ? "cursor-not-allowed bg-[#f8f6f4] text-[#7f8997]"
            : "bg-white focus:border-[#b8d3a7] focus:ring-2 focus:ring-[#dbe9ce]"
        }`}
      />
    </div>
  );
}

/* ===============================================================
   Profile Select
================================================================ */

function ProfileSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-[12px] font-medium text-[#8a94a3]">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-2xl border border-[#eee8e3] bg-white px-4 text-[14px] text-[#303846] outline-none transition focus:border-[#b8d3a7] focus:ring-2 focus:ring-[#dbe9ce]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
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
   Check Icon
================================================================ */

function CheckIcon() {
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
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

/* ===============================================================
   Spinner Icon
================================================================ */

function SpinnerIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin"
    >
      <path d="M12 2v4" />
      <path d="m16.2 3.8-2.8 2.8" />
      <path d="M22 12h-4" />
      <path d="m20.2 16.2-2.8-2.8" />
      <path d="M12 22v-4" />
      <path d="m7.8 20.2 2.8-2.8" />
      <path d="M2 12h4" />
      <path d="m3.8 7.8 2.8 2.8" />
    </svg>
  );
}
