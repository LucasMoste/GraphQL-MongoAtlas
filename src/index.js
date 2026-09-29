require('dotenv').config();

const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');

const connectDB = require('./config/db');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

// ─────────────────────────────────────────────────────────
//  Bootstrap principal
// ─────────────────────────────────────────────────────────
const startServer = async () => {
  // 1. Conectar a MongoDB Atlas antes de levantar el servidor
  await connectDB();

  // 2. Instanciar Apollo Server v5
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: false,  // necesario para Apollo Sandbox y clientes externos

    // ──────────────────────────────────────────
    //  Introspección SIEMPRE habilitada
    // ──────────────────────────────────────────
    introspection: true,

    // ──────────────────────────────────────────
    //  Apollo Sandbox como landing page
    // ──────────────────────────────────────────
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({
        // Permite que el Sandbox embebido haga peticiones cross-origin
        embed: true,
        includeCookies: false,
      }),
    ],

    // ──────────────────────────────────────────
    //  Formateo de errores
    // ──────────────────────────────────────────
    formatError: (formattedError, error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[GraphQL Error]', error);
      }
      return formattedError;
    },
  });

  // 3. Iniciar servidor con startStandaloneServer (Apollo v5)
  const PORT = parseInt(process.env.PORT || '4000', 10);

  const { url } = await startStandaloneServer(server, {
    listen: { port: PORT, host: '0.0.0.0' },
    context: async ({ req }) => ({
      headers: req.headers,
    }),
    // Deshabilita protección CSRF para permitir Apollo Sandbox y clientes externos
    allowBatchedHttpRequests: true,
  });

  console.log(`\n🚀 Servidor corriendo en ${url}`);
  console.log(`📡 GraphQL endpoint:  ${url}`);
  console.log(`🛸 Apollo Sandbox:    ${url}\n`);
};

// ─────────────────────────────────────────────────────────
//  Manejo de rechazos de promesas no capturadas
// ─────────────────────────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  process.exit(1);
});

startServer();
