const mongoose = require('mongoose');

/**
 * Schema de Mongoose para la colección "products".
 * Campos requeridos por el enunciado: name, price, stock, category, description.
 * El campo "id" es generado automáticamente por MongoDB (_id).
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio.'],
      trim: true,
      maxlength: [200, 'El nombre no puede superar los 200 caracteres.'],
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio.'],
      min: [0, 'El precio no puede ser negativo.'],
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio.'],
      min: [0, 'El stock no puede ser negativo.'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria.'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true, // createdAt y updatedAt automáticos
    versionKey: false,
  }
);

// Índice de texto para búsquedas por nombre o descripción
productSchema.index({ name: 'text', description: 'text' });

// Índice por categoría para filtros frecuentes
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
