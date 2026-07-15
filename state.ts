import { createSignal, type Accessor } from "solid-js"
import type { TuiPromptRef } from "@opencode-ai/plugin/tui"

export const [isNormal, setIsNormal] = createSignal(false)
export const [isLeaderActive, setIsLeaderActive] = createSignal(false)
export const [leaderGroup, setLeaderGroup] = createSignal<string>()
export const [leaderSelectedIndex, setLeaderSelectedIndex] = createSignal(0)

let activePromptRef: TuiPromptRef | undefined
export function setActivePromptRef(ref: TuiPromptRef | undefined) {
  activePromptRef = ref
}
export function getActivePromptRef(): TuiPromptRef | undefined {
  return activePromptRef
}

export type VimMode = "INSERT" | "NORMAL"

export function currentMode(): Accessor<VimMode> {
  return () => (isNormal() ? "NORMAL" : "INSERT")
}
