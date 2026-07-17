/** @jsxImportSource @opentui/solid */
import type { TuiPlugin, TuiPluginApi, TuiPluginModule, TuiSlotPlugin, KeyEvent } from "@opencode-ai/plugin/tui"
import { setVimApi, VimPromptSlot, VimHomePromptSlot } from "./prompt-slot"
import { StatusBar } from "./status-bar"
import { openLeaderMenu } from "./leader-menu-ui"
import {
  getNormal,
  setNormal,
  setLeader,
  getActivePromptRef,
} from "./state"

let modePopper: (() => void) | undefined
let pendingG = false

function enterNormal(api: TuiPluginApi) {
  if (getNormal(api.keymap)) return
  setNormal(api.keymap, true)
  try {
    getActivePromptRef()?.blur()
  } catch {
    /* ignore */
  }
  modePopper = api.mode.push("vim-normal")
}

function enterInsert(api: TuiPluginApi) {
  setNormal(api.keymap, false)
  setLeader(api.keymap, false)
  if (modePopper) {
    modePopper()
    modePopper = undefined
  }
  try {
    getActivePromptRef()?.focus()
  } catch {
    /* ignore */
  }
}

// Consume a key only when we actually handle it, so that opencode's native
// keybinds keep working in NORMAL mode. Notably the subagent navigation keys
// (up/down/left/right) and the leader sequences (<leader>down = view
// subagents, <leader>q, <leader>t, ...) must pass through to the host keymap.
// j/k/g/G/i/a/o/... are not bound by opencode, so they are safe to consume.

function handleNormalKey(api: TuiPluginApi, ctx: { event: KeyEvent; consume: () => void }) {
  const ev = ctx.event
  const name = ev.name

  if (pendingG) {
    pendingG = false
    if (name === "g") {
      ctx.consume()
      api.keymap.dispatchCommand("session.first")
    }
    return
  }

  switch (name) {
    case "i":
    case "a":
    case "I":
    case "A":
    case "o":
    case "O":
      ctx.consume()
      enterInsert(api)
      return
    case "j":
      ctx.consume()
      api.keymap.dispatchCommand("session.line.down")
      return
    case "k":
      ctx.consume()
      api.keymap.dispatchCommand("session.line.up")
      return
    case "g":
      ctx.consume()
      pendingG = true
      return
    case "G":
      ctx.consume()
      api.keymap.dispatchCommand("session.last")
      return
    case "space":
      ctx.consume()
      openLeaderMenu(api)
      return
    case ":":
      ctx.consume()
      api.keymap.dispatchCommand("command.palette.show")
      return
    case "escape":
      return
    default:
      return
  }
}

const tui: TuiPlugin = async (api, options, meta) => {
  if (options?.enabled === false) return

  setVimApi(api)

  // Keep the entry revision in sync with theme-only updates so the host
  // refreshes its basename-keyed theme cache.
  // Install and activate the plugin-owned theme automatically. The host uses
  // the file basename as the theme id, so this registers "oc-minimal".
  await api.theme.install("./oc-minimal.json")
  api.theme.set("oc-minimal")

  // Keep the stock home screen quiet while this plugin is active. Restore the
  // user's previous tip preference if the plugin is disabled at runtime.
  const tipsHidden = api.kv.get("tips_hidden", false)
  api.kv.set("tips_hidden", true)
  api.lifecycle.onDispose(() => api.kv.set("tips_hidden", tipsHidden))

  const sidebar = api.kv.get<"auto" | "hide">("sidebar", "auto")
  api.kv.set("sidebar", "hide")
  api.lifecycle.onDispose(() => api.kv.set("sidebar", sidebar))

  const logoSlot: TuiSlotPlugin = {
    slots: {
      home_logo() {
        return <box />
      },
    },
  }

  const sessionPromptSlot: TuiSlotPlugin = {
    slots: {
      session_prompt(_ctx, props) {
        return <VimPromptSlot {...(props as any)} />
      },
    },
  }
  const homePromptSlot: TuiSlotPlugin = {
    slots: {
      home_prompt(_ctx, props) {
        return <VimHomePromptSlot {...(props as any)} />
      },
    },
  }
  const footerSlot: TuiSlotPlugin = {
    slots: {
      home_footer() {
        return <StatusBar api={api} />
      },
    },
  }

  api.slots.register(logoSlot)
  api.slots.register(sessionPromptSlot)
  api.slots.register(homePromptSlot)
  api.slots.register(footerSlot)

  api.keymap.intercept("key", (ctx) => {
    if (api.ui.dialog.open) return
    const ev = ctx.event

    if (!getNormal(api.keymap)) {
      if (ev.name === "escape") {
        ctx.consume()
        enterNormal(api)
      }
      return
    }

    // In NORMAL mode, do NOT blanket-consume. Only the keys we actually
    // handle (j/k/g/G/i/a/o/A/O/space/:) are consumed inside handleNormalKey.
    // Everything else passes through to the host keymap so opencode's native
    // keybinds keep working:
    //   - up/down/left/right -> subagent navigation
    //   - ctrl+x (leader), then down -> view subagents (session.child.first)
    //   - ctrl+b -> background subagents, ctrl+f -> pin, <leader>q, <leader>t ...
    handleNormalKey(api, ctx)
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id: "opencode-vim",
  tui,
}

export default plugin
