// Theme switching has been removed — the app now uses a single, fixed dark theme
// defined directly in globals.css (see the `:root` block).
//
// This passthrough component is kept only so existing imports of `ThemeProvider`
// in your layout don't break. Once you've removed the import/usage from
// layout.tsx, you can delete this file entirely along with the
// `next-themes` dependency (`npm uninstall next-themes`).

function ThemeProvider({ children }: { children: React.ReactNode }) {
  return children
}

export { ThemeProvider }
