"use client";

import { useEffect, useState } from "react";

import {
  updateRelationshipPreferences,
} from "@/app/lib/api/connectionApi";

import type {
  RelationshipPreference,
  RelationshipPreferenceUpdate,
} from "@/app/types/connection";

interface RelationshipSettingsProps {
  connectionId: string;
  preferences: RelationshipPreference;
  onSaved?: (preferences: RelationshipPreference) => void;
  onClose: () => void;
}

const relationshipOptions = [
  "Friend",
  "Close Friend",
  "Elder Brother",
  "Younger Brother",
  "Elder Sister",
  "Younger Sister",
  "Parent",
  "Cousin",
  "Colleague",
  "Mentor",
  "Student",
  "Other",
];

const toneOptions = [
  "Casual",
  "Friendly",
  "Respectful",
  "Warm",
  "Professional",
];

const humorOptions = [
  "Low",
  "Medium",
  "High",
];

const languageOptions = [
  "English",
  "Hindi",
  "Hinglish",
];

export default function RelationshipSettings({
  connectionId,
  preferences,
  onSaved,
  onClose,
}: RelationshipSettingsProps) {
  const [formData, setFormData] =
    useState<RelationshipPreferenceUpdate>({
      relationship: preferences.relationship,
      tone: preferences.tone,
      humor_level: preferences.humor_level,
      language: preferences.language,
      custom_instruction: preferences.custom_instruction,
    });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // ---------------------------------------------------------------
  // Keep form synchronized if preferences change externally.
  // ---------------------------------------------------------------

  useEffect(() => {
    setFormData({
      relationship: preferences.relationship,
      tone: preferences.tone,
      humor_level: preferences.humor_level,
      language: preferences.language,
      custom_instruction: preferences.custom_instruction,
    });
  }, [preferences]);

  // ---------------------------------------------------------------
  // Update field
  // ---------------------------------------------------------------

  function updateField(
    field: keyof RelationshipPreferenceUpdate,
    value: string
  ) {
    setFormData((previous) => ({
      ...previous,
      [field]: value || null,
    }));

    setSaved(false);
    setError("");
  }

  // ---------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const updatedConnection =
        await updateRelationshipPreferences(
          connectionId,
          formData
        );

      onSaved?.(
        updatedConnection.relationship_preferences
      );

      setSaved(true);
    } catch (err) {
      console.error(
        "[RELATIONSHIP SETTINGS] Failed to save:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save preferences."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202733]/25 px-5 py-6 backdrop-blur-sm">
      <div className="w-full max-w-[480px] overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(32,39,51,0.15)]">
        {/* =======================================================
            Header
        ======================================================== */}

        <div className="flex items-center justify-between border-b border-[#eee8e3] px-6 py-5">
          <div>
            <h2 className="text-[19px] font-semibold text-[#202733]">
              Pally relationship
            </h2>

            <p className="mt-1 text-[13px] text-[#8993a2]">
              Choose how your Pally should behave with this person.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#8993a2] transition hover:bg-[#fff5ed] hover:text-[#202733]"
            aria-label="Close relationship settings"
          >
            <CloseIcon />
          </button>
        </div>

        {/* =======================================================
            Form
        ======================================================== */}

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
          {/* Relationship */}

          <div>
            <label
              htmlFor="relationship"
              className="mb-2 block text-[13px] font-medium text-[#4c5665]"
            >
              Relationship
            </label>

            <select
              id="relationship"
              value={formData.relationship ?? ""}
              onChange={(event) =>
                updateField(
                  "relationship",
                  event.target.value
                )
              }
              className="w-full rounded-2xl border border-[#e3e0dd] bg-[#fffdfb] px-4 py-3 text-[14px] text-[#303846] outline-none transition focus:border-[#b5cc9d] focus:ring-2 focus:ring-[#dbe9ce]"
            >
              <option value="">
                Select relationship
              </option>

              {relationshipOptions.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Tone */}

          <div>
            <label
              htmlFor="tone"
              className="mb-2 block text-[13px] font-medium text-[#4c5665]"
            >
              Tone
            </label>

            <select
              id="tone"
              value={formData.tone ?? ""}
              onChange={(event) =>
                updateField(
                  "tone",
                  event.target.value
                )
              }
              className="w-full rounded-2xl border border-[#e3e0dd] bg-[#fffdfb] px-4 py-3 text-[14px] text-[#303846] outline-none transition focus:border-[#b5cc9d] focus:ring-2 focus:ring-[#dbe9ce]"
            >
              <option value="">
                Select tone
              </option>

              {toneOptions.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Humor */}

          <div>
            <label
              htmlFor="humor_level"
              className="mb-2 block text-[13px] font-medium text-[#4c5665]"
            >
              Humor
            </label>

            <select
              id="humor_level"
              value={formData.humor_level ?? ""}
              onChange={(event) =>
                updateField(
                  "humor_level",
                  event.target.value
                )
              }
              className="w-full rounded-2xl border border-[#e3e0dd] bg-[#fffdfb] px-4 py-3 text-[14px] text-[#303846] outline-none transition focus:border-[#b5cc9d] focus:ring-2 focus:ring-[#dbe9ce]"
            >
              <option value="">
                Select humor level
              </option>

              {humorOptions.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}

          <div>
            <label
              htmlFor="language"
              className="mb-2 block text-[13px] font-medium text-[#4c5665]"
            >
              Language
            </label>

            <select
              id="language"
              value={formData.language ?? ""}
              onChange={(event) =>
                updateField(
                  "language",
                  event.target.value
                )
              }
              className="w-full rounded-2xl border border-[#e3e0dd] bg-[#fffdfb] px-4 py-3 text-[14px] text-[#303846] outline-none transition focus:border-[#b5cc9d] focus:ring-2 focus:ring-[#dbe9ce]"
            >
              <option value="">
                Use Pally's language
              </option>

              {languageOptions.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Custom instruction */}

          <div>
            <label
              htmlFor="custom_instruction"
              className="mb-2 block text-[13px] font-medium text-[#4c5665]"
            >
              Custom instruction
            </label>

            <textarea
              id="custom_instruction"
              value={formData.custom_instruction ?? ""}
              onChange={(event) =>
                updateField(
                  "custom_instruction",
                  event.target.value
                )
              }
              placeholder="Example: Be respectful but playful."
              rows={3}
              maxLength={500}
              className="w-full resize-none rounded-2xl border border-[#e3e0dd] bg-[#fffdfb] px-4 py-3 text-[14px] leading-[1.45] text-[#303846] outline-none transition placeholder:text-[#a2aab5] focus:border-[#b5cc9d] focus:ring-2 focus:ring-[#dbe9ce]"
            />

            <p className="mt-1 text-right text-[11px] text-[#a2aab5]">
              {(formData.custom_instruction ?? "").length}/500
            </p>
          </div>

          {/* Error */}

          {error && (
            <div className="rounded-2xl bg-[#fff1ee] px-4 py-3 text-[13px] text-[#b45d4f]">
              {error}
            </div>
          )}

          {/* Success */}

          {saved && (
            <div className="rounded-2xl bg-[#eef7e8] px-4 py-3 text-[13px] text-[#5d7350]">
              Your Pally's relationship preferences have been saved.
            </div>
          )}
        </div>

        {/* =======================================================
            Footer
        ======================================================== */}

        <div className="flex items-center justify-end gap-3 border-t border-[#eee8e3] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full px-4 py-2.5 text-[13px] font-medium text-[#697485] transition hover:bg-[#f7f4f1] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-[#75ad55] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_5px_15px_rgba(117,173,85,0.20)] transition hover:bg-[#68a14b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save preferences"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ===============================================================
// Close icon
// ===============================================================

function CloseIcon() {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}