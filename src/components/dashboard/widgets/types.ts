export type WidgetProps<T = unknown> = {
  data?: T;
  loading?: boolean;
  error?: string | null;
  locked?: boolean;
  lockReason?: string;
  empty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
};
