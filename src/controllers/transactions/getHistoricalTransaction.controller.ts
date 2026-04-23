import dayjs from 'dayjs';
import type { FastifyReply, FastifyRequest } from 'fastify';
import prisma from '../../config/prisma';
import type { GetHistoricalTransactionQuery } from '../../schemas/transaction.schema';
import 'dayjs/locale/pt-br';
import utc from 'dayjs/plugin/utc';

dayjs.locale('pt-br');
dayjs.extend(utc);

export const getHistoricalTransactions = async (
  request: FastifyRequest<{ Querystring: GetHistoricalTransactionQuery }>,
  reply: FastifyReply,
): Promise<void> => {
  const userId = request.userId;

  if (!userId) {
    reply.status(401).send({ error: 'Usuário não autenticado' });
    return;
  }

  const month = Number(request.query.month);
  const year = Number(request.query.year);
  const months = Number(request.query.months ?? 6);

  if (!month || !year) {
    reply.status(400).send({ error: 'month e year são obrigatórios' });
    return;
  }

  const baseDate = new Date(year, month - 1, 1);

  const startDate = dayjs
    .utc(baseDate)
    .subtract(months - 1, 'month')
    .startOf('month')
    .toDate();

  const endDate = dayjs.utc(baseDate).endOf('month').toDate();

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    const monthlyData = Array.from({ length: months }, (_, i) => {
      const date = dayjs.utc(baseDate).subtract(months - 1 - i, 'month');

      return {
        name: date.format('MMM/YYYY'),
        income: 0,
        expense: 0,
      };
    });

    transactions.forEach((transaction) => {
      const transactionDate = dayjs.utc(transaction.date);

      const monthIndex = transactionDate.diff(dayjs.utc(startDate), 'month');

      if (monthIndex >= 0 && monthIndex < months) {
        if (transaction.type === 'income') {
          monthlyData[monthIndex].income += transaction.amount;
        } else {
          monthlyData[monthIndex].expense += transaction.amount;
        }
      }
    });

    reply.send(monthlyData);
  } catch (err) {
    console.error(err);
    reply.status(500).send({ error: 'Erro ao buscar transações' });
  }
};
