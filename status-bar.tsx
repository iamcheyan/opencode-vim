/** @jsxImportSource @opentui/solid */
import { Show, type JSX } from "solid-js"
import { useKeymapSelector } from "@opentui/keymap/solid"
import type { TuiPluginApi, TuiSlotProps } from "@opencode-ai/plugin/tui"
import { getNormal, getLeader } from "./state"

export function StatusBar(props: { api: TuiPluginApi }): JSX.Element {
  const theme = () => props.api.theme.current
  const normal = useKeymapSelector((km) => getNormal(km))
  const leader = useKeymapSelector((km) => getLeader(km))
  const dir = () => props.api.state.path.directory ?? process.cwd()

  return (
    <box
      flexDirection="row"
      width="100%"
      flexShrink={0}
      gap={2}
      alignItems="center"
      paddingLeft={1}
      paddingRight={1}
    >
      <box
        flexShrink={0}
        paddingLeft={1}
        paddingRight={1}
        backgroundColor={normal() ? theme().text : theme().textMuted}
      >
        <text fg={normal() ? theme().backgroundElement : theme().text}>
          {normal() ? "NORMAL" : "INSERT"}
        </text>
      </box>
      <Show when={leader()} fallback={null as any}>
        <text fg={theme().text}>LEADER</text>
      </Show>
      <box flexDirection="row" flexShrink={0}>
        <text fg={theme().textMuted}>cwd </text>
        <text fg={theme().text}>{dir()}</text>
      </box>
    </box>
  )
}
