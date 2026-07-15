# opencode-vim development notes

## Scope

`opencode-vim` is a pure TUI plugin. It uses only the public opencode plugin API and does not require a fork, patched source tree, or custom binary.

The plugin owns:

- Vim-style INSERT and NORMAL modes
- the LEADER menu
- the home status bar
- the minimal home-screen slots
- the automatically installed `oc-minimal` theme
- plugin-time preferences such as hiding tips and the session sidebar

The stock opencode route layout and transcript renderer remain host-owned. If the public API does not expose a slot or property, the plugin must use a safe visual fallback or leave the host behavior unchanged.

## Architecture

- `index.tsx`: plugin entry, theme and slot registration, Vim key interception
- `state.ts`: host-keymap-backed reactive state and active Prompt ref
- `prompt-slot.tsx`: wraps the public Prompt component and renders the mode badge
- `leader-menu.ts`: menu definitions and actions
- `leader-menu-ui.tsx`: menu dialog and navigation
- `status-bar.tsx`: minimal home footer
- `oc-minimal.json`: grayscale theme installed and selected by the plugin

Shared reactive state is stored with `api.keymap.setData()` and read with `useKeymapSelector()`. This keeps updates inside the host keymap/reactivity instance and avoids external Solid instance mismatches.

## Visual policy

- Keep the terminal, panels, and transcript backgrounds dark and low contrast.
- Use grayscale for ordinary UI and retain subdued colors only for important error, warning, success, and diff states.
- Do not mutate resolved theme objects at runtime.
- Do not use render-loop hooks, polling timers, or private Prompt properties.
- Prefer public slots and Prompt props for all UI changes.

## Installation model

Users add the plugin entry file to the `plugin` array in their TUI configuration. On activation, the plugin installs and selects `oc-minimal` automatically. No separate theme configuration is required.

Runtime dependencies must be compatible with the versions bundled by the installed opencode release.
