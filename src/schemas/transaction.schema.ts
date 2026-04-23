import { TransactionType } from '@prisma/client';
import { ObjectId } from 'mongodb';
import { TypeOf, z } from 'zod';

const isValidObjectId = (id: string): boolean => ObjectId.isValid(id);

export const createTransactionSchema = z.object({
  description: z.string().min(1, 'Descrição Obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  date: z.coerce.date({
    errorMap: () => ({ message: 'Data Invalida' }),
  }),
  categoryId: z.string().refine(isValidObjectId, {
    message: 'Categoria Invalida',
  }),
  type: z.enum([TransactionType.expense, TransactionType.income], {
    message: 'Tipo Invalido',
  }),
});

export const getTransactionSchema = z.object({
  month: z.string().optional(),
  year: z.string().optional(),
  type: z
    .enum([TransactionType.expense, TransactionType.income], {
      message: 'Tipo Invalido',
    })
    .optional(),
  categoryId: z
    .string()
    .refine(isValidObjectId, {
      message: 'Categoria Invalida',
    })
    .optional(),
});

export const getTransactionSummarySchema = z.object({
  month: z.string({ message: 'O mês é obrigatório' }),
  year: z.string({ message: 'O ano é obrigatório' }),
});

export const getHistoricalTransactionSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
  months: z.coerce.number().min(1).max(12).optional(),
});

export const deleteTransactioSchema = z.object({
  id: z.string().refine(isValidObjectId, {
    message: 'Id Invalido',
  }),
});

export type GetTransactionQuery = z.infer<typeof getTransactionSchema>;
export type GetTransactionSummaryQuery = z.infer<
  typeof getTransactionSummarySchema
>;
export type GetHistoricalTransactionQuery = z.infer<
  typeof getHistoricalTransactionSchema
>;
export type DeleteTransactionParams = z.infer<typeof deleteTransactioSchema>;
