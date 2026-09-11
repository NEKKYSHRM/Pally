"use client";

import { FormEvent, useEffect, useState } from "react";
import { createPet, getPet, updatePet } from "@/app/lib/api/petApi";
import type { Pet, PetCreate, PetUpdate } from "@/app/types/pet";

const PERSONALITIES = [
  "Friendly",
  "Playful",
  "Calm",
  "Curious",
  "Energetic",
  "Witty",
  "Chill",
  "Adventurous",
];

const HUMOR_STYLES = [
  "Playful",
  "Sarcastic",
  "Dry",
  "Silly",
  "Wholesome",
  "Witty",
];

const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "hinglish", label: "Hinglish" },
  { value: "hindi", label: "Hindi" },
];

const INTERESTS = [
  "Music",
  "Gaming",
  "Movies",
  "Sports",
  "Travel",
  "Food",
  "Memes",
  "Books",
  "Technology",
  "Art",
];

export default function page() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [personality, setPersonality] = useState<string[]>([]);
  const [humor, setHumor] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["english"]);
  const [interests, setInterests] = useState<string[]>([]);
  const [activityEnabled, setActivityEnabled] = useState(true);

  useEffect(() => {
    loadPet();
  }, []);

  async function loadPet() {
    try {
      setLoading(true);
      setError("");

      const currentPet = await getPet();

      setPet(currentPet);
      setName(currentPet.name);
      setPersonality(currentPet.personality);
      setHumor(currentPet.humor);
      setLanguages(currentPet.languages);
      setInterests(currentPet.interests);
      setActivityEnabled(currentPet.activity_enabled);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load your Pally.";

      // A 404 simply means the user has not created a Pally yet.
      if (message.toLowerCase().includes("not found")) {
        setPet(null);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleValue(
    value: string,
    current: string[],
    setter: (values: string[]) => void,
  ) {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
      return;
    }

    setter([...current, value]);
  }

  function toggleLanguage(language: string) {
    if (languages.includes(language)) {
      if (languages.length === 1) return;

      setLanguages(
        languages.filter((item) => item !== language),
      );

      return;
    }

    if (languages.length >= 3) return;

    setLanguages([...languages, language]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Give your Pally a name first.");
      return;
    }

    if (languages.length === 0) {
      setError("Choose at least one language.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (pet) {
        const data: PetUpdate = {
          name: name.trim(),
          personality,
          humor,
          languages,
          interests,
          activity_enabled: activityEnabled,
        };

        const updatedPet = await updatePet(data);
        setPet(updatedPet);
      } else {
        const data: PetCreate = {
          name: name.trim(),
          personality,
          humor,
          languages,
          interests,
        };

        const createdPet = await createPet(data);
        setPet(createdPet);
      }

      setSuccess("Your Pally is all set ✨");

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-full bg-[#FFF9F3] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-8 h-8 w-48 rounded-full bg-[#F3E6DB]" />

          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="h-[520px] rounded-[32px] bg-[#F3E6DB]" />
            <div className="h-[520px] rounded-[32px] bg-[#F3E6DB]" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-full overflow-hidden bg-[#FFF9F3] px-4 py-5 pb-24 sm:px-6 sm:py-7 lg:px-8 lg:pb-8">
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#F9D7C4] opacity-70" />
      <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-[#DCEBD9] opacity-70" />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#7B7068] shadow-sm ring-1 ring-[#F0E5DC]">
                <span className="h-2 w-2 rounded-full bg-[#91B98A]" />
                My Pally
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#3F3935] sm:text-4xl">
                {pet ? `Meet ${pet.name}` : "Create your Pally"}
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#847A73] sm:text-base">
                {pet
                  ? "Shape your little companion's personality, interests, and vibe."
                  : "Give your little companion a personality and make them yours."}
              </p>
            </div>

            {pet && (
              <div className="flex items-center gap-2 self-start rounded-full bg-white px-3 py-2 shadow-sm ring-1 ring-[#F0E5DC] sm:self-auto">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    activityEnabled
                      ? "bg-[#91B98A]"
                      : "bg-[#C7BEB8]"
                  }`}
                />

                <span className="text-xs font-semibold text-[#6E655F]">
                  {activityEnabled
                    ? "Pally activity on"
                    : "Activity paused"}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Feedback */}
        {(error || success) && (
          <div
            className={`mb-5 rounded-2xl px-4 py-3 text-sm font-medium ${
              error
                ? "bg-[#FCE8E4] text-[#A04F45]"
                : "bg-[#E5F1E2] text-[#587453]"
            }`}
          >
            {error || success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
            {/* ------------------------------------------------------ */}
            {/* Pally Preview */}
            {/* ------------------------------------------------------ */}
            <section className="relative overflow-hidden rounded-[32px] bg-white p-6 shadow-[0_12px_40px_rgba(91,73,59,0.07)] ring-1 ring-[#F0E5DC] sm:p-8">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#F8D8C6]" />
              <div className="absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-[#DCEBD9]" />

              <div className="relative flex h-full flex-col">
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#A8998D]">
                    Your little companion
                  </p>
                </div>

                {/* Avatar */}
                <div className="flex flex-1 flex-col items-center justify-center py-6">
                  <div className="relative">
                    <div className="flex h-36 w-36 items-center justify-center rounded-[42%] bg-[#F7D4C0] shadow-[0_18px_35px_rgba(194,132,99,0.18)] sm:h-44 sm:w-44">
                      <div className="relative h-28 w-28 sm:h-32 sm:w-32">
                        {/* ears */}
                        <div className="absolute -left-3 top-1 h-12 w-10 rotate-[-28deg] rounded-[55%] bg-[#E9B99F]" />
                        <div className="absolute -right-3 top-1 h-12 w-10 rotate-[28deg] rounded-[55%] bg-[#E9B99F]" />

                        {/* face */}
                        <div className="absolute inset-0 rounded-[45%] bg-[#FBE6D8]">
                          <div className="absolute left-7 top-11 h-2.5 w-2.5 rounded-full bg-[#514942]" />
                          <div className="absolute right-7 top-11 h-2.5 w-2.5 rounded-full bg-[#514942]" />

                          <div className="absolute left-1/2 top-[58%] h-3 w-5 -translate-x-1/2 rounded-full bg-[#7E665C]" />

                          <div className="absolute left-1/2 top-[68%] h-2 w-8 -translate-x-1/2 rounded-b-full border-b-2 border-[#7E665C]" />

                          <div className="absolute left-3 top-14 h-3 w-5 rounded-full bg-[#F3BDAA] opacity-70" />
                          <div className="absolute right-3 top-14 h-3 w-5 rounded-full bg-[#F3BDAA] opacity-70" />
                        </div>
                      </div>
                    </div>

                    <div className="absolute -bottom-2 -right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-md ring-1 ring-[#F0E5DC]">
                      ✨
                    </div>
                  </div>

                  <div className="mt-7 text-center">
                    <h2 className="text-2xl font-bold text-[#403934]">
                      {name.trim() || "Your Pally"}
                    </h2>

                    <p className="mt-1 text-sm text-[#8A7F77]">
                      {personality.length > 0
                        ? personality.slice(0, 2).join(" · ")
                        : "Still discovering their personality"}
                    </p>
                  </div>

                  {/* Personality summary */}
                  <div className="mt-6 flex max-w-sm flex-wrap justify-center gap-2">
                    {personality.slice(0, 4).map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-[#F8EEE7] px-3 py-1.5 text-xs font-semibold text-[#786A61]"
                      >
                        {item}
                      </span>
                    ))}

                    {personality.length === 0 && (
                      <span className="rounded-full bg-[#F8EEE7] px-3 py-1.5 text-xs font-semibold text-[#9A8D84]">
                        Pick a personality
                      </span>
                    )}
                  </div>
                </div>

                {/* Activity */}
                <div className="mt-5 rounded-2xl bg-[#FFF9F3] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#4B433E]">
                        Let your Pally be active
                      </p>

                      <p className="mt-1 text-xs leading-5 text-[#8A7F77]">
                        Allow your Pally to participate and react when activity
                        features are enabled.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setActivityEnabled(!activityEnabled)
                      }
                      aria-pressed={activityEnabled}
                      className={`relative mt-0.5 h-7 w-12 shrink-0 rounded-full transition ${
                        activityEnabled
                          ? "bg-[#86A87F]"
                          : "bg-[#D5CCC5]"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                          activityEnabled
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* ------------------------------------------------------ */}
            {/* Configuration */}
            {/* ------------------------------------------------------ */}
            <section className="rounded-[32px] bg-white p-6 shadow-[0_12px_40px_rgba(91,73,59,0.07)] ring-1 ring-[#F0E5DC] sm:p-8">
              <div className="mb-7">
                <h2 className="text-xl font-bold text-[#403934]">
                  Tell us about your Pally
                </h2>

                <p className="mt-1 text-sm text-[#8A7F77]">
                  These choices shape how your Pally feels and communicates.
                </p>
              </div>

              <div className="space-y-7">
                {/* Name */}
                <div>
                  <label
                    htmlFor="pally-name"
                    className="mb-2 block text-sm font-bold text-[#514942]"
                  >
                    Pally name
                  </label>

                  <input
                    id="pally-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Milo"
                    maxLength={50}
                    className="h-12 w-full rounded-2xl border-0 bg-[#FFF9F3] px-4 text-sm font-medium text-[#403934] outline-none ring-1 ring-[#F0E5DC] placeholder:text-[#B4A9A1] focus:ring-2 focus:ring-[#D9A98E]"
                  />

                  <div className="mt-1.5 flex justify-end">
                    <span className="text-[11px] text-[#B0A49B]">
                      {name.length}/50
                    </span>
                  </div>
                </div>

                {/* Personality */}
                <ChoiceSection
                  title="Personality"
                  description="Pick the traits that feel most like them."
                  values={PERSONALITIES}
                  selected={personality}
                  onToggle={(value) =>
                    toggleValue(
                      value.toLowerCase(),
                      personality,
                      setPersonality,
                    )
                  }
                />

                {/* Humor */}
                <ChoiceSection
                  title="Humor"
                  description="What kind of jokes should your Pally enjoy?"
                  values={HUMOR_STYLES}
                  selected={humor}
                  onToggle={(value) =>
                    toggleValue(
                      value.toLowerCase(),
                      humor,
                      setHumor,
                    )
                  }
                />

                {/* Languages */}
                <div>
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-[#514942]">
                      Languages
                    </h3>
                    <p className="mt-1 text-xs text-[#9A8F87]">
                      Choose up to 3.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((language) => {
                      const selected = languages.includes(
                        language.value,
                      );

                      return (
                        <button
                          key={language.value}
                          type="button"
                          onClick={() =>
                            toggleLanguage(language.value)
                          }
                          className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                            selected
                              ? "bg-[#DCEBD9] text-[#587453] ring-1 ring-[#BFD5BA]"
                              : "bg-[#FFF9F3] text-[#81766E] ring-1 ring-[#F0E5DC] hover:bg-[#F9F0E8]"
                          }`}
                        >
                          {selected && (
                            <span className="mr-1.5">✓</span>
                          )}
                          {language.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interests */}
                <ChoiceSection
                  title="Interests"
                  description="Things your Pally can get excited about."
                  values={INTERESTS}
                  selected={interests}
                  onToggle={(value) =>
                    toggleValue(
                      value.toLowerCase(),
                      interests,
                      setInterests,
                    )
                  }
                />

                {/* Save */}
                <div className="border-t border-[#F1E8E1] pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#D99F80] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(190,126,91,0.18)] transition hover:bg-[#CF9272] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Saving...
                      </>
                    ) : pet ? (
                      <>
                        Save changes
                        <span>→</span>
                      </>
                    ) : (
                      <>
                        Create my Pally
                        <span>→</span>
                      </>
                    )}
                  </button>

                  <p className="mt-3 text-center text-[11px] leading-5 text-[#A69A92]">
                    You can always change these choices later.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </form>
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Choice Section                                                      */
/* ------------------------------------------------------------------ */

interface ChoiceSectionProps {
  title: string;
  description: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
}

function ChoiceSection({
  title,
  description,
  values,
  selected,
  onToggle,
}: ChoiceSectionProps) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-sm font-bold text-[#514942]">
          {title}
        </h3>

        <p className="mt-1 text-xs text-[#9A8F87]">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {values.map((value) => {
          const normalizedValue = value.toLowerCase();
          const isSelected = selected.includes(normalizedValue);

          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
                isSelected
                  ? "bg-[#F8D7C5] text-[#805D4B] ring-1 ring-[#EABBA3]"
                  : "bg-[#FFF9F3] text-[#81766E] ring-1 ring-[#F0E5DC] hover:bg-[#F9F0E8]"
              }`}
            >
              {isSelected && (
                <span className="mr-1.5">✓</span>
              )}
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}