/** @jsxImportSource @opentui/solid */
import { Show, type JSX } from "solid-js"
import { RGBA } from "@opentui/core"
import type { TuiPluginApi, TuiSlotProps } from "@opencode-ai/plugin/tui"
import { setActivePromptRef, isNormal, currentMode } from "./state"

const [apiRef, setApiRef] = (() => {
  let a: TuiPluginApi | undefined
  return [
    () => a,
    (v: TuiPluginApi | undefined) => {
      a = v
    },
  ] as const
})()

export function setVimApi(api: TuiPluginApi) {
  setApiRef(api)
}

export function VimPromptSlot(props: TuiSlotProps<"session_prompt">): JSX.Element {
  const Prompt = (apiRef() as TuiPluginApi).ui.Prompt
  const Slot = (apiRef() as TuiPluginApi).ui.Slot
  const theme = () => (apiRef() as TuiPluginApi).theme.current
  const mode = currentMode()

  const right = (
    <Show when={props.session_id}>
      <Slot name="session_prompt_right" session_id={props.session_id!} />
    </Show>
  )

  return (
    <Prompt
      sessionID={props.session_id}
      visible={props.visible}
      disabled={props.disabled}
      onSubmit={props.on_submit}
      ref={(ref: any) => {
        props.ref?.(ref)
        setActivePromptRef(ref)
      }}
      right={right}
      hint={
        <box flexShrink={0} flexDirection="row">
          <text
            fg={mode() === "NORMAL" ? RGBA.fromInts(120, 200, 255, 255) : theme().textMuted}
          >
            {mode() === "NORMAL" ? "NORMAL" : "INSERT"}
          </text>
        </box>
      }
    />
  )
}

export function VimHomePromptSlot(props: TuiSlotProps<"home_prompt">): JSX.Element {
  const Prompt = (apiRef() as TuiPluginApi).ui.Prompt
  const Slot = (apiRef() as TuiPluginApi).ui.Slot
  const theme = () => (apiRef() as TuiPluginApi).theme.current
  const mode = currentMode()

  return (
    <Prompt
      hint={
        <box flexShrink={0} flexDirection="row">
          <text
            fg={mode() === "NORMAL" ? RGBA.fromInts(120, 200, 255, 255) : theme().textMuted}
          >
            {mode() === "NORMAL" ? "NORMAL" : "INSERT"}
          </text>
        </box>
      }
      right={<Slot name="home_prompt_right" />}
      ref={(ref: any) => {
        props.ref?.(ref)
        setActivePromptRef(ref)
      }}
    />
  )
}
