const mongoose = require('mongoose');

/**
 * Conecta la aplicación a MongoDB Atlas.
 * Usa la URI definida en la variable de entorno MONGODB_URI.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌  MONGODB_URI no está definida en las variables de entorno.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('✅  Conectado a MongoDB Atlas correctamente.');
  } catch (error) {
    console.error('❌  Error al conectar con MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
