/** @jsxImportSource @opentui/solid */
import { Show, type JSX } from "solid-js"
import { useKeymapSelector } from "@opentui/keymap/solid"
import type { TuiPluginApi, TuiSlotProps } from "@opencode-ai/plugin/tui"
import { setActivePromptRef, getNormal } from "./state"

const [apiRef, setApiRef] = (() => {
  let a: TuiPluginApi | undefined
  return [() => a, (v: TuiPluginApi | undefined) => { a = v }] as const
})()

export function setVimApi(api: TuiPluginApi) {
  setApiRef(api)
}

function ModeTag(): JSX.Element {
  const theme = () => (apiRef() as TuiPluginApi).theme.current
  const normal = useKeymapSelector((km) => getNormal(km))
  return (
    <box
      flexShrink={0}
      flexDirection="row"
      paddingLeft={1}
      paddingRight={1}
      backgroundColor={normal() ? theme().text : theme().textMuted}
    >
      <text fg={normal() ? theme().backgroundElement : theme().text}>
        {normal() ? "NORMAL" : "INSERT"}
      </text>
    </box>
  )
}

export function VimPromptSlot(props: TuiSlotProps<"session_prompt">): JSX.Element {
  const Prompt = (apiRef() as TuiPluginApi).ui.Prompt
  const Slot = (apiRef() as TuiPluginApi).ui.Slot

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
      hint={<ModeTag />}
    />
  )
}

export function VimHomePromptSlot(props: TuiSlotProps<"home_prompt">): JSX.Element {
  const Prompt = (apiRef() as TuiPluginApi).ui.Prompt

  return (
    <Prompt
      ref={(ref: any) => {
        props.ref?.(ref)
        setActivePromptRef(ref)
      }}
    />
  )
}
