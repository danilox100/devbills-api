import { TransactionType } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';

import prisma from '../../config/prisma';

import type { GetTransactionSummaryQuery } from '../../schemas/transaction.schema';

import type { CategorySummary } from '../../types/category.type';
import type { TransactionSummary } from '../../types/transaction.type';

export const getTransactionSummary = async (
  request: FastifyRequest<{
    Querystring: GetTransactionSummaryQuery;
  }>,
  reply: FastifyReply,
): Promise<void> => {
  const userId = request.userId;

  if (!userId) {
    reply.status(401).send({
      error: 'Usuário não autenticado',
    });

    return;
  }

  const monthNumber = Number(request.query.month);
  const yearNumber = Number(request.query.year);

  if (!monthNumber || !yearNumber) {
    reply.status(400).send({
      error: 'Mês e ano inválidos',
    });

    return;
  }

  /**
   * RANGE DO MÊS
   */
  const startDate = new Date(yearNumber, monthNumber - 1, 1);

  const endDate = new Date(yearNumber, monthNumber, 1);

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    let totalExpenses = 0;
    let totalIncomes = 0;

    const groupedExpenses = new Map<string, CategorySummary>();

    for (const transaction of transactions) {
      if (transaction.type === TransactionType.expense) {
        totalExpenses += transaction.amount;

        const existing = groupedExpenses.get(transaction.categoryId) ?? {
          categoryId: transaction.categoryId,
          categoryName: transaction.category.name,
          categoryColor: transaction.category.color,
          amount: 0,
          percentage: 0,
        };

        existing.amount += transaction.amount;

        groupedExpenses.set(transaction.categoryId, existing);
      } else {
        totalIncomes += transaction.amount;
      }
    }

    const expensesByCategory = Array.from(groupedExpenses.values())
      .map((entry) => ({
        ...entry,
        percentage:
          totalExpenses > 0
            ? Number(((entry.amount / totalExpenses) * 100).toFixed(2))
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const summary: TransactionSummary = {
      totalExpenses,
      totalIncomes,
      balance: Number((totalIncomes - totalExpenses).toFixed(2)),
      expensesByCategory,
    };

    return reply.status(200).send(summary);
  } catch (err) {
    request.log.error(err);

    return reply.status(500).send({
      error: 'Erro interno do servidor',
    });
  }
};
