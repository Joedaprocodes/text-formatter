import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import './App.css'
import { useState, useRef, useEffect } from 'react'
import { Copy, CopyCheck, Minus, Plus, RefreshCcw, RefreshCw, UserCircle } from "lucide-react";

function App() {
  const [text, setText] = useState('');
  const textSizes = { sm: 'text-sm', md: 'text-md', lg: 'text-lg', xl: 'text-xl' };
  const [fontSize, setFontSize] = useState(textSizes['sm']);
  const [selectedStyle, setSelectedStyle] = useState('bold');
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(JSON.parse(localStorage.getItem("dark")))
  const textareaRef = useRef(null);

  // console.log(JSON.parse(localStorage.getItem("dark")))

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem("dark", "true")
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem("dark", "false")
    }
  }, [isDark]);

  const styles = {
    bold: { cap: 0x1D400, low: 0x1D41A, num: 0x1D7CE },
    italic: {
      cap: 0x1D434,
      low: 0x1D44E,
      exceptions: { 'h': 0x210E }
    },
    boldItalic: { cap: 0x1D468, low: 0x1D482 },
    script: {
      cap: 0x1D49C, low: 0x1D4B6,
      exceptions: {
        'B': 0x212C, 'E': 0x2130, 'F': 0x2131, 'H': 0x210B, 'I': 0x2110, 'L': 0x2112, 'M': 0x2133, 'R': 0x211B,
        'e': 0x212F, 'g': 0x210A, 'o': 0x2134
      }
    },
    boldScript: { cap: 0x1D4D0, low: 0x1D4EA },
    fraktur: {
      cap: 0x1D504, low: 0x1D51E,
      exceptions: { 'C': 0x212D, 'H': 0x210C, 'I': 0x2111, 'R': 0x211C, 'Z': 0x2124 }
    },
    boldFraktur: { cap: 0x1D56C, low: 0x1D586 },
    doubleStruck: {
      cap: 0x1D538, low: 0x1D552, num: 0x1D7D8,
      exceptions: { 'C': 0x2102, 'H': 0x210D, 'N': 0x2115, 'P': 0x2119, 'Q': 0x211A, 'R': 0x211D, 'Z': 0x2124 }
    },
    sansSerif: { cap: 0x1D5A0, low: 0x1D5BA, num: 0x1D7E2 },
    sansSerifBold: { cap: 0x1D5D4, low: 0x1D5EE, num: 0x1D7EC },
    sansSerifItalic: { cap: 0x1D608, low: 0x1D622 },
    sansSerifBoldItalic: { cap: 0x1D63C, low: 0x1D656 },
    monospace: { cap: 0x1D670, low: 0x1D68A, num: 0x1D7F6 }
  };

  function convertToUnicodeStyle(input, styleKey) {
    const selected = styles[styleKey] || styles.bold;
    return input.split('').map(char => {
      if (selected.exceptions && selected.exceptions[char]) {
        return String.fromCodePoint(selected.exceptions[char]);
      }
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(selected.cap + (code - 65));
      if (code >= 97 && code <= 122) return String.fromCodePoint(selected.low + (code - 97));
      if (code >= 48 && code <= 57 && selected.num) return String.fromCodePoint(selected.num + (code - 48));
      return char;
    }).join('');
  }

  const applyStyleToSelection = (styleKey) => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== end) {
      const prefix = text.substring(0, start);
      const selection = text.substring(start, end);
      const suffix = text.substring(end);

      const transformed = convertToUnicodeStyle(selection, styleKey);
      setText(prefix + transformed + suffix);

      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start, start + transformed.length);
      }, 0);
    } else {
      setSelectedStyle(styleKey);
    }
  };

  const copyFinalToClipboard = () => {
    const output = convertToUnicodeStyle(text, selectedStyle);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
    navigator.clipboard.writeText(output);
  }

  const pasteFromClipboard = async () => {
    try {
      // 1. Get text from clipboard
      const clipboardText = await navigator.clipboard.readText();
      const el = textareaRef.current;
      if (!el) return;

      // 2. Get cursor/selection positions
      const start = el.selectionStart;
      const end = el.selectionEnd;

      // 3. Splice the clipboard text into the existing state
      const prefix = text.substring(0, start);
      const suffix = text.substring(end);
      const newText = prefix + clipboardText + suffix;

      setText(newText);

      // 4. Return focus and move cursor to the end of the pasted content
      setTimeout(() => {
        el.focus();
        const newCursorPos = start + clipboardText.length;
        el.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);

      console.log("Text pasted successfully!");
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      // Note: This will fail if the user denies the browser's permission prompt
    }
  };

  function copyToClipboard() {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selection = text.substring(start, end);

    navigator.clipboard.writeText(selection);
  }

  return (
    <div className="App w-screen min-h-screen bg-gray-300 dark:bg-black text-black dark:text-white ">
      <div className="max-w-xl mx-auto p-3 flex flex-col gap-6">
        <header className='text-center py-8'>
          <p className='text-lg font-black tracking-tight  text-black dark:text-white uppercase'>Text Formatter by <a href="https://josh-web361.vercel.app" target="_blank">Ayeni Joshua</a></p>
          <p className='text-slate-500 mt-2'>Unicode styles</p>
        </header>

        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="flex flex-col w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-gray-300 dark:bg-zinc-900 overflow-hidden shadow-sm">
              <div className="flex items-center justify-between p-2 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center space-x-2">
                  <Switch id="dark-mode"
                    checked={!isDark}
                    className="cursor-pointer"
                    onClick={() => setIsDark(!isDark)} />
                  <Label htmlFor="dark-mode"
                    className="cursor-pointer"
                  >Light Mode</Label>
                </div>
                <ButtonGroup>
                  {Object.keys(textSizes).map((size) => (
                    <Button key={size}
                      variant={fontSize === textSizes[size] ? "default" : "outline"}
                      onClick={() => setFontSize(textSizes[size])}
                    >
                      {size}
                    </Button>
                  ))}
                </ButtonGroup>
                <ButtonGroup>
                  <Button variant="outline" onClick={() => copyFinalToClipboard()}
                    className="cursor-pointer"
                  >
                    {copied ? <CopyCheck className="w-3 -h-3" /> : <Copy className="w-3 -h-3" />}
                    Copy</Button>
                </ButtonGroup>
              </div>

              <textarea
                ref={textareaRef}
                class={`border-input placeholder:text-muted-foreground focus-visible:border-ring 
                focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40
                 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content w-full rounded-md border 
                 bg-transparent px-3 py-2 shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px]
                  disabled:cursor-not-allowed disabled:opacity-50 text-black dark:text-white min-h-40
                   selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black ${fontSize}`}
                // className={`text-black dark:text-white min-h-40 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black ${fontSize}`}
                placeholder="Type here, highlight text, and right-click to format selection..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </ContextMenuTrigger>

          <ContextMenuContent className="w-64">
            <ContextMenuItem inset key="paste" onSelect={() => copyToClipboard()} >
              Copy to Clipboard
            </ContextMenuItem>
            <ContextMenuItem inset key="paste" onSelect={() => pasteFromClipboard()}>
              Paste from Clipboard
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuLabel inset>Quick Styles</ContextMenuLabel>
            {Object.keys(styles).slice(0, 2).map((s) => (
              <ContextMenuItem
                inset
                key={s}
                checked={selectedStyle === s}
                onSelect={() => applyStyleToSelection(s)}
              >
                <span className="capitalize">{s.replace(/([A-Z])/g, ' $1')}</span>
                {/* <ContextMenuShortcut>
                  {s === 'bold' ? '⌘B' : '⌘I'}
                </ContextMenuShortcut> */}
              </ContextMenuItem>
            ))}
            <ContextMenuSub>
              <ContextMenuSeparator />
              <ContextMenuSubTrigger inset>All styles</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-56">
                {Object.keys(styles).slice(2).map((s) => (
                  <ContextMenuItem
                    inset
                    key={s}
                    checked={selectedStyle === s}
                    onSelect={() => applyStyleToSelection(s)}
                    className="text-xs"
                  >
                    {/* Preview the name in its own style */}
                    {convertToUnicodeStyle(s.replace(/([A-Z])/g, ' $1'), s)}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuItem inset
              onClick={() => window.open("https://josh-web361.vercel.app", "_blank")}
            >
              Visit my Portfolio
              <ContextMenuShortcut>
                <UserCircle className="w-4 h-4" />
              </ContextMenuShortcut>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {/* Output Area */}
        {/* <div className='relative bg-black/40 border border-slate-800 w-full rounded-xl min-h-32 p-6 break-words'>
          <p className="text-blue-500 text-[10px] mb-4 uppercase font-bold tracking-widest">Global Style Preview</p>
          <p className='text-white text-2xl leading-relaxed'>
            {text ? convertToUnicodeStyle(text, selectedStyle) : <span className="text-slate-700">Preview area...</span>}
          </p>

          {text && (
            <button
              onClick={copyToClipboard}
              className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1 rounded-full transition-colors font-semibold"
            >
              Copy
            </button>
          )}
        </div> */}

        <footer className="text-slate-600 text-[11px] text-center">
          Tip: Select text within the box to apply styles to specific words.
        </footer>
      </div>
    </div>
  )
}

export default App;