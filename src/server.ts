import app from './app';
import { env } from './config/env';
import initializeFirebaseAdmin from './config/firebase';
import { prismaConnect } from './config/prisma';
import { initializeGlobalCategories } from './services/globalCategories.service';

const PORT = env.PORT;

initializeFirebaseAdmin();

const startServer = async () => {
  try {
    await prismaConnect();

    try {
      await initializeGlobalCategories();
    } catch (err) {
      console.error('Erro ao inicializar categorias:', err);
    }

    await app.listen({ port: PORT });

    console.log(`🚀 Server is running at http://localhost:${PORT}`);
  } catch (err) {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  }
};

startServer();
