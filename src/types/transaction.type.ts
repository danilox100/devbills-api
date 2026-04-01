import type { TransactionType } from '@prisma/client';
import type { CategorySummary } from './category.type';

export interface TransactionFilter {
  userId: String;
  date?: {
    gte: Date;
    lte: Date;
  };
  type?: TransactionType;
  categoryId?: string;
}

export interface TransactionSummary {
  totalExpenses: number;
  totalIncomes: number;
  balance: number;
  expensesByCategory: CategorySummary[];
}
