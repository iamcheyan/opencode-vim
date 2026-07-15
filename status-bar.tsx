/** @jsxImportSource @opentui/solid */
import { For, Show, createEffect, createSignal, type JSX } from "solid-js"
import { RGBA } from "@opentui/core"
import type { TuiPluginApi, TuiSlotProps } from "@opencode-ai/plugin/tui"
import { isNormal, isLeaderActive, currentMode } from "./state"

export function StatusBar(props: TuiSlotProps<"home_footer"> & { api: TuiPluginApi }): JSX.Element {
  const theme = () => props.api.theme.current
  const mode = currentMode()
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
      border={["top"]}
      borderColor={theme().border}
    >
      <text fg={mode() === "NORMAL" ? RGBA.fromInts(120, 200, 255, 255) : theme().success}>
        {mode() === "NORMAL" ? "▌ NORMAL" : "▌ INSERT"}
      </text>
      <Show when={isLeaderActive()} fallback={null as any}>
        <text fg={theme().accent}>LEADER</text>
      </Show>
      <box flexDirection="row" flexShrink={0}>
        <text fg={theme().textMuted}>cwd </text>
        <text fg={theme().text}>{dir()}</text>
      </box>
    </box>
  )
}

export function RecentSessions(props: TuiSlotProps<"home_bottom"> & { api: TuiPluginApi }): JSX.Element {
  const theme = () => props.api.theme.current
  const [sessions, setSessions] = createSignal<Array<{ id: string; title: string; directory: string }>>([])

  const load = async () => {
    try {
      const client = props.api.client as any
      const result: any = await client.session.list({
        query: { limit: 8, directory: props.api.state.path.directory },
      })
      const raw =
        Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : []
      setSessions(
        raw
          .map((s: any) => ({ id: s.id, title: s.title, directory: s.directory }))
          .filter((s: any) => s && s.id),
      )
    } catch {
      setSessions([])
    }
  }

  createEffect(() => {
    load()
  })

  return (
    <Show when={sessions().length > 0} fallback={null as any}>
      <box
        width="100%"
        maxWidth={80}
        alignItems="flex-start"
        flexShrink={0}
        flexDirection="column"
        gap={0}
        paddingTop={1}
      >
        <text fg={theme().textMuted}>recent sessions</text>
        <For each={sessions()}>
          {(s) => (
            <text fg={theme().text}>
              <span style={{ fg: theme().accent }}>•</span> {s.title || s.id}
            </text>
          )}
        </For>
      </box>
    </Show>
  )
}
