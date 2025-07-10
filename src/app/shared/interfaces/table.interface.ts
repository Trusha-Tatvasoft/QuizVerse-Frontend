export interface ColumnDef {
  key: string;
  label: string;
  type: 'text' | 'tag' | 'button' | 'icon' | 'custom' | 'profile';
  align?: 'left' | 'right' | 'center';
  isSortable?: boolean;
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
