/** @jsxImportSource @opentui/solid */
import { For, Show, createSignal, type JSX } from "solid-js"
import { useBindings } from "@opentui/keymap/solid"
import {
  DEFAULT_LEADER_MENU,
  isSeparator,
  executeAction,
  type LeaderGroup,
  type LeaderItem,
  type LeaderLeaf,
} from "./leader-menu"
import { setIsLeaderActive } from "./state"

type View = { kind: "groups" } | { kind: "items"; group: LeaderGroup }

export function LeaderMenu(props: { api: import("@opencode-ai/plugin/tui").TuiPluginApi; onClose: () => void }): JSX.Element {
  const groups = DEFAULT_LEADER_MENU
  const [view, setView] = createSignal<View>({ kind: "groups" })
  const [selected, setSelected] = createSignal(0)
  const [groupIndex, setGroupIndex] = createSignal(0)

  const items = () => (view().kind === "items" ? view().group.items : groups)
  const selectedItem = (): LeaderItem | undefined => items()[selected()]

  const openGroup = (g: LeaderGroup) => {
    setView({ kind: "items", group: g })
    setSelected(0)
  }

  const back = () => {
    setView({ kind: "groups" })
    setSelected(groupIndex())
  }

  const activate = () => {
    const item = selectedItem()
    if (!item || isSeparator(item)) return
    props.onClose()
    executeAction(props.api, item as LeaderLeaf)
  }

  const groupCommands = groups.map((g) => ({
    name: `vim_leader_open_${g.key}`,
    run() {
      setGroupIndex(groups.indexOf(g))
      openGroup(g)
    },
  }))

  useBindings(() => ({
    enabled: () => props.api.ui.dialog.open,
    commands: [
      {
        name: "vim_leader_close",
        run() {
          props.onClose()
        },
      },
      {
        name: "vim_leader_activate",
        run() {
          activate()
        },
      },
      {
        name: "vim_leader_back",
        run() {
          if (view().kind === "items") back()
          else props.onClose()
        },
      },
      {
        name: "vim_leader_down",
        run() {
          setSelected((i) => Math.min(items().length - 1, i + 1))
        },
      },
      {
        name: "vim_leader_up",
        run() {
          setSelected((i) => Math.max(0, i - 1))
        },
      },
      ...groupCommands,
    ],
    bindings: [
      { key: "escape", cmd: "vim_leader_close" },
      { key: "backspace", cmd: "vim_leader_back" },
      { key: "enter", cmd: "vim_leader_activate" },
      { key: "return", cmd: "vim_leader_activate" },
      { key: "j", cmd: "vim_leader_down" },
      { key: "down", cmd: "vim_leader_down" },
      { key: "k", cmd: "vim_leader_up" },
      { key: "up", cmd: "vim_leader_up" },
      ...groups.map((g) => ({ key: g.key, cmd: `vim_leader_open_${g.key}` })),
    ],
  }))

  const theme = () => props.api.theme.current
  const skin = () => ({
    panel: theme().backgroundPanel,
    border: theme().border,
    text: theme().text,
    muted: theme().textMuted,
    accent: theme().accent,
    selected: theme().selectedListItemText,
  })

  return (
    <box
      flexDirection="column"
      width="100%"
      backgroundColor={skin().panel}
      paddingTop={1}
      paddingBottom={1}
      paddingLeft={2}
      paddingRight={2}
      gap={1}
    >
      <text fg={skin().accent}>
        <b>LEADER</b>
        <span style={{ fg: skin().muted }}>
          {" "}
          — space then key{view().kind === "items" ? " · backspace to go back" : ""}
        </span>
      </text>

      <Show when={view().kind === "groups"}>
        <box flexDirection="column" gap={0}>
          <For each={groups}>
            {(g, i) => (
              <text fg={i() === groupIndex() ? skin().selected : skin().text}>
                <span style={{ fg: skin().accent }}> {g.key} </span> {g.label}
              </text>
            )}
          </For>
        </box>
      </Show>

      <Show when={view().kind === "items"}>
        <box flexDirection="column" gap={0}>
          <For each={view().group.items}>
            {(item, i) =>
              isSeparator(item) ? (
                <text fg={skin().muted}> ──────────────</text>
              ) : (
                <text fg={i() === selected() ? skin().selected : skin().text}>
                  <span style={{ fg: skin().accent }}> {item.key} </span> {item.label}
                </text>
              )
            }
          </For>
        </box>
      </Show>
    </box>
  )
}

export function openLeaderMenu(api: import("@opencode-ai/plugin/tui").TuiPluginApi): void {
  setIsLeaderActive(true)
  api.ui.dialog.setSize("large")
  api.ui.dialog.replace(() => (
    <LeaderMenu
      api={api}
      onClose={() => {
        setIsLeaderActive(false)
        api.ui.dialog.clear()
      }}
    />
  ))
}
