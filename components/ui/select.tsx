"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Check, ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A designed replacement for the native <select>, whose open list is drawn
 * by the operating system and cannot be styled.
 *
 * It follows the WAI-ARIA "select-only combobox" pattern: focus stays on the
 * button (role="combobox"), the open list is a listbox, and the highlighted
 * option is announced through aria-activedescendant.
 *
 *   ↓ / Enter / Space   open                ↑ ↓ Home End   move
 *   letters             jump to a match     Enter / Space  choose
 *   Escape              close, keep value   Tab            close
 *
 * The value travels in a hidden input named `name`, so a surrounding form's
 * FormData reads it exactly as it read the native select. The list opens
 * upwards when there is no room below. Tokens only (design/tokens.css);
 * the opening animation is `.select-pop`, which reduced motion switches off.
 */

export type SelectOption = {
  /** "" is the placeholder — nothing chosen. */
  value: string;
  label: string;
  icon?: LucideIcon;
};

export function Select({
  name,
  label,
  options,
  defaultValue = "",
}: {
  name: string;
  label: string;
  options: SelectOption[];
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [up, setUp] = useState(false);

  const uid = useId();
  const labelId = `${uid}-label`;
  const buttonId = `${uid}-button`;
  const listId = `${uid}-list`;
  const optionId = (i: number) => `${uid}-opt-${i}`;

  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const typed = useRef({ text: "", at: 0 });

  const selected = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const current = options[selected];
  const CurrentIcon = current?.icon;

  function show(at = selected) {
    const r = button.current?.getBoundingClientRect();
    if (r) {
      const below = window.innerHeight - r.bottom;
      setUp(below < 280 && r.top > below);
    }
    setActive(at);
    setOpen(true);
  }

  function hide(focus = true) {
    setOpen(false);
    if (focus) button.current?.focus();
  }

  function choose(i: number) {
    setValue(options[i].value);
    hide();
  }

  // Close on a pointer press anywhere outside.
  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (!wrap.current?.contains(e.target as Node)) hide(false);
    }
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the highlighted option in view while moving through a long list.
  useEffect(() => {
    if (!open) return;
    document
      .getElementById(optionId(active))
      ?.scrollIntoView({ block: "nearest" });
    // optionId is stable for the life of the component
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, active]);

  function typeahead(key: string) {
    const now = Date.now();
    const t = typed.current;
    t.text = now - t.at > 600 ? key : t.text + key;
    t.at = now;
    const start = open ? active : selected;
    const order = [
      ...options.slice(start + 1),
      ...options.slice(0, start + 1),
    ];
    const hit = order.find((o) =>
      o.label.toLowerCase().startsWith(t.text.toLowerCase()),
    );
    if (!hit) return;
    const i = options.indexOf(hit);
    if (open) setActive(i);
    else show(i);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      } else if (e.key.length === 1 && /\S/.test(e.key)) {
        typeahead(e.key);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((a) => Math.min(last, a + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(last);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
        e.preventDefault();
        hide();
        break;
      case "Tab":
        hide(false);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) typeahead(e.key);
    }
  }

  return (
    <div ref={wrap} className="relative">
      <span id={labelId} className="block text-sm font-medium text-text">
        {label}
      </span>

      <button
        ref={button}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${buttonId}`}
        aria-activedescendant={open ? optionId(active) : undefined}
        onClick={() => (open ? hide() : show())}
        onKeyDown={onKeyDown}
        className={cn(
          "mt-2 flex w-full items-center gap-2.5 rounded-md border bg-surface px-3.5 py-2.5 text-left text-sm transition-colors hover:border-accent",
          open ? "border-accent" : "border-line",
          value === "" ? "text-text-3" : "text-text",
        )}
      >
        {CurrentIcon ? (
          <CurrentIcon
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className={value === "" ? "shrink-0 text-text-3" : "shrink-0 text-accent"}
          />
        ) : null}
        <span className="min-w-0 flex-1 truncate">{current?.label}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          aria-hidden="true"
          className={cn(
            "shrink-0 text-text-3 transition-transform duration-200 ease-(--ease-out)",
            open && "rotate-180 text-accent",
          )}
        />
      </button>

      <input type="hidden" name={name} value={value} />

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          data-up={up ? "" : undefined}
          className={cn(
            "select-pop absolute inset-x-0 z-30 max-h-64 overflow-auto rounded-md border border-line bg-surface p-1.5 shadow-soft",
            up ? "bottom-full mb-2" : "top-full mt-2",
          )}
        >
          {options.map((o, i) => {
            const Icon = o.icon;
            const isSelected = i === selected;
            const isActive = i === active;
            return (
              <li
                key={o.value || "__none"}
                id={optionId(i)}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(i)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2 text-sm transition-colors",
                  isSelected
                    ? "bg-accent-soft font-semibold text-text"
                    : isActive
                      ? "bg-surface-2 text-text"
                      : "text-text-2",
                )}
              >
                {Icon ? (
                  <Icon
                    size={16}
                    strokeWidth={1.75}
                    aria-hidden="true"
                    className={isSelected || isActive ? "shrink-0 text-accent" : "shrink-0 text-text-3"}
                  />
                ) : null}
                <span className="min-w-0 flex-1">{o.label}</span>
                {isSelected ? (
                  <Check
                    size={15}
                    strokeWidth={2.25}
                    aria-hidden="true"
                    className="shrink-0 text-accent"
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}