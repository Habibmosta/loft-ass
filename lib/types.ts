export interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  decimalDigits: number
  isDefault: boolean
  ratio: number;
  createdAt: Date
  updatedAt: Date
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  due_date?: Date;
  assigned_to?: string;
  team_id?: string;
  loft_id?: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  amount: number;
  description?: string;
  transaction_type: 'income' | 'expense';
  status: 'pending' | 'completed' | 'failed';
  date: Date;
  category?: string;
  loft_id?: string; // Add loft_id
  user_id?: string;
  currency_id?: string;
  created_at: Date;
  updated_at: Date;
}
