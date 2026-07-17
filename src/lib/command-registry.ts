export type CommandItem = {
  id: string;
  label: string;
  keywords?: string[];
  group: "navigation" | "actions" | "content";
  shortcut?: string;
  run: () => void;
};

type RegistryListener = () => void;

const commands = new Map<string, CommandItem>();
const listeners = new Set<RegistryListener>();

function notify() {
  listeners.forEach((l) => l());
}

export function registerCommand(command: CommandItem) {
  commands.set(command.id, command);
  notify();
  return () => {
    commands.delete(command.id);
    notify();
  };
}

export function getCommands() {
  return Array.from(commands.values());
}

export function subscribeCommands(listener: RegistryListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function fuzzyMatch(query: string, item: CommandItem) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [item.label, ...(item.keywords ?? [])].join(" ").toLowerCase();
  return hay.includes(q) || q.split(/\s+/).every((part) => hay.includes(part));
}
