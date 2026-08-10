import { useState } from "react";
import type { UseCreateCommunityResult } from "@/src/hooks/useCreateCommunity";

interface Props {
  initialName?: string;
  initialDescription?: string;
  setCommunityInfo: UseCreateCommunityResult["setCommunityInfo"];
  goBack: UseCreateCommunityResult["goBack"];
}

export function StepCommunityInfo({ initialName = "", initialDescription = "", setCommunityInfo, goBack }: Props) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [touched, setTouched] = useState(false);

  const nameError = touched && name.trim().length === 0 ? "Community name is required" : undefined;
  const canProceed = name.trim().length > 0 && name.trim().length <= 80;

  const handleNext = () => {
    setTouched(true);
    if (!canProceed) return;
    setCommunityInfo(name.trim(), description.trim());
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-white">Community Details</h2>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Community name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="e.g. ZuKas Residency"
          className={`w-full px-3 py-2 rounded-lg bg-gray-800 border text-white placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm
            ${nameError ? "border-red-500" : "border-gray-600"}`}
        />
        {nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
        <p className="mt-1 text-xs text-gray-500">{name.length}/80</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description <span className="text-gray-500">(optional)</span>
        </label>
        <textarea
          value={description}
          maxLength={500}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your community's purpose…"
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white
            placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
        />
        <p className="mt-1 text-xs text-gray-500">{description.length}/500</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={goBack}
          className="flex-1 py-2 px-4 rounded-lg border border-gray-600 text-gray-300
            hover:bg-gray-700 transition-colors text-sm"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className="flex-1 py-2 px-4 rounded-lg bg-purple-600 text-white font-medium
            hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
