export interface ColumnDef {
  key: string;
  label: string;
  type: 'text' | 'tag' | 'button' | 'icon' | 'profile' | 'currency' | 'category';
  pipe?: 'date' | 'currency';
  pipeArgs?: any[]; // args like ['USD', 'symbol', '1.2-2'] or ['yyyy-MM-dd']
  align?: 'left' | 'right' | 'center';
  isSortable?: boolean;
  class?: string;
  iconClass?: string;
  iconColor?: 'primary' | 'accent' | 'warn';
  textKey?: string; // text input with tag (optional)
}
export interface TableData {
  [key: string]: any;
}

export interface ActionIcon {
  icon: string;
  tooltip?: string;
  action: string;
  color?: string;
}
