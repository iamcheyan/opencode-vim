# opencode-vim repository rules

## Project boundary

- This project must remain a pure opencode TUI plugin.
- Implement all behavior and styling through files in this repository, using the public plugin API, plugin-rendered UI, and theme configuration.
- Do not modify, patch, fork, or build the opencode upstream source tree.
- Do not require users to rebuild, replace, or install a custom opencode binary.
- Do not rely on private props or seams that exist only in a locally modified opencode checkout. In particular, the plugin must work without a custom `Prompt.compact` prop.
- Treat the installed stock opencode binary and its built-in layout as immutable.

## Handling host limitations

- Prefer a plugin-side rendering or overlay solution when the public API cannot directly style a host component.
- If an element cannot be removed through the plugin API, make it visually blend into the configured background without globally hiding unrelated semantic colors.
- Avoid mutating shared theme color objects at runtime, frame hooks, polling intervals, or other global styling hacks that can affect unrelated host UI.
- Preserve legibility and semantic colors for errors, warnings, success states, selections, and plugin controls.
- When the host API makes an exact result impossible, document the limitation and implement the closest safe plugin-only fallback. Do not propose an upstream rebuild as the project solution.

## Scope

- Writable implementation scope is this repository only.
- The neighboring opencode checkout may be inspected as read-only reference material to understand public API behavior, but it is not part of the implementation.
