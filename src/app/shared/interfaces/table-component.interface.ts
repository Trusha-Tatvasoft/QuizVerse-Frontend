export interface ColumnDef {
  key: string;
  label: string;
  type: 'text' | 'tag' | 'button' | 'profile' | 'category' | 'question-pool';
  pipe?: 'date' | 'currency';
  pipeArgs?: [currencyCode?: string, display?: string | boolean, digits?: string]; // args like ['USD', 'symbol', '1.2-2'] or ['yyyy-MM-dd']
  align?: 'left' | 'right' | 'center';
  isSortable?: boolean;
  class?: 'text-bold' | 'text-muted' | 'text-success' | 'text-failed'; // for text class - bold / muted
  textKey?: string; // text input with tag (optional)
}

export interface TableData {
  [key: string]: unknown; // Dynamic key-value pairs for table rows
}

export interface ActionIcon {
  icon: string;
  tooltip?: string;
  action: string;
  color?: string;
}

export interface CurrencyValue {
  amount: number;
  currencyCode?: string;
}
