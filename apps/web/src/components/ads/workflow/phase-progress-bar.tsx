"use client";

import {
  CheckCircle,
  File02,
  Edit01,
  Users01,
  VideoRecorder,
  Eye,
  Globe02,
} from "@untitledui/icons";
import { PHASE_CONFIG } from "../ad-constants";

interface PhaseProgressBarProps {
  currentPhase: number;
  totalVideos: number;
  videosReadyInCurrentPhase: number;
  onPhaseClick?: (phase: number) => void;
}

const PHASE_ICONS = [File02, Edit01, Users01, VideoRecorder, Eye, Globe02];

export function PhaseProgressBar({
  currentPhase,
  totalVideos,
  videosReadyInCurrentPhase,
  onPhaseClick,
}: PhaseProgressBarProps) {
  return (
    <div className="w-full">
      {/* Desktop / Tablet */}
      <div className="hidden md:flex items-center">
        {Array.from({ length: 6 }, (_, i) => i + 1).map((phase) => {
          const Icon = PHASE_ICONS[phase - 1]!;
          const config = PHASE_CONFIG[phase];
          const isCompleted = phase < currentPhase;
          const isCurrent = phase === currentPhase;
          const isFuture = phase > currentPhase;
          const isClickable = isCompleted || isCurrent;

          return (
            <div key={phase} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onPhaseClick?.(phase)}
                  disabled={isFuture}
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                    isCompleted
                      ? "bg-success-primary text-white cursor-pointer hover:bg-success-secondary"
                      : isCurrent
                        ? "bg-brand-primary text-white ring-4 ring-brand-secondary cursor-pointer"
                        : "border-2 border-border-secondary text-quaternary cursor-default opacity-50"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </button>

                <span
                  className={`text-xs font-medium mt-2 hidden lg:block ${
                    isCompleted
                      ? "text-success-primary"
                      : isCurrent
                        ? "text-brand-primary"
                        : "text-quaternary"
                  }`}
                >
                  {config?.label}
                </span>

                <span className="text-xs text-quaternary mt-0.5 hidden lg:block">
                  {isCurrent
                    ? `${videosReadyInCurrentPhase}/${totalVideos}`
                    : isCompleted
                      ? ""
                      : ""}
                </span>
              </div>

              {phase < 6 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    phase < currentPhase
                      ? "bg-success-primary"
                      : phase === currentPhase
                        ? "bg-brand-primary"
                        : "bg-border-secondary"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="flex md:hidden flex-col gap-2">
        {Array.from({ length: 6 }, (_, i) => i + 1).map((phase) => {
          const Icon = PHASE_ICONS[phase - 1]!;
          const config = PHASE_CONFIG[phase];
          const isCompleted = phase < currentPhase;
          const isCurrent = phase === currentPhase;
          const isFuture = phase > currentPhase;
          const isClickable = isCompleted || isCurrent;

          return (
            <div key={phase} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => isClickable && onPhaseClick?.(phase)}
                disabled={isFuture}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                  isCompleted
                    ? "bg-success-primary text-white"
                    : isCurrent
                      ? "bg-brand-primary text-white ring-4 ring-brand-secondary"
                      : "border-2 border-border-secondary text-quaternary opacity-50"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </button>

              <div className="flex-1">
                <span
                  className={`text-sm font-medium ${
                    isCompleted
                      ? "text-success-primary"
                      : isCurrent
                        ? "text-brand-primary"
                        : "text-quaternary"
                  }`}
                >
                  {config?.label}
                </span>
                {isCurrent && (
                  <span className="text-xs text-brand-primary ml-2">
                    {videosReadyInCurrentPhase}/{totalVideos} videos
                  </span>
                )}
              </div>

              {phase < 6 && (
                <div
                  className={`absolute left-[15px] mt-8 w-0.5 h-2 ${
                    phase < currentPhase
                      ? "bg-success-primary"
                      : "bg-border-secondary"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
