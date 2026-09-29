const mongoose = require('mongoose');
const Product = require('../models/Product');

/**
 * Helpers
 */

/** Valida que un string sea un ObjectId válido de Mongoose */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/** Construye el objeto de filtro de Mongoose a partir de ProductFilter */
const buildMongoFilter = (filter = {}) => {
  const query = {};

  if (filter.search) {
    // Búsqueda de texto sobre el índice de texto (name + description)
    query.$text = { $search: filter.search };
  }

  if (filter.category) {
    query.category = filter.category;
  }

  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    query.price = {};
    if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice;
    if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice;
  }

  if (filter.inStock === true) {
    query.stock = { $gt: 0 };
  }

  return query;
};

/**
 * Resolvers GraphQL
 */
const resolvers = {
  // ─────────────────────────────────────────────
  //  Mapeo de campos: _id de Mongo → id en GraphQL
  // ─────────────────────────────────────────────
  Product: {
    id: (parent) => parent._id.toString(),
    createdAt: (parent) =>
      parent.createdAt ? parent.createdAt.toISOString() : null,
    updatedAt: (parent) =>
      parent.updatedAt ? parent.updatedAt.toISOString() : null,
  },

  // ─────────────────────────────────────────────
  //  QUERIES
  // ─────────────────────────────────────────────
  Query: {
    /**
     * products — Lista de productos con filtros, paginación y ordenamiento.
     *
     * Parámetros:
     *   filter   → objeto ProductFilter (search, category, minPrice, maxPrice, inStock)
     *   limit    → cantidad de resultados por página (default: 20)
     *   offset   → desplazamiento (default: 0)
     *   sortBy   → campo por el que ordenar (default: "createdAt")
     *   sortOrder→ "asc" | "desc" (default: "desc")
     */
    products: async (_, { filter, limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' }) => {
      const mongoFilter = buildMongoFilter(filter);
      const sortDirection = sortOrder === 'asc' ? 1 : -1;

      const [products, total] = await Promise.all([
        Product.find(mongoFilter)
          .sort({ [sortBy]: sortDirection })
          .skip(offset)
          .limit(limit)
          .lean(),
        Product.countDocuments(mongoFilter),
      ]);

      const page = Math.floor(offset / limit) + 1;
      const totalPages = Math.ceil(total / limit);

      return { products, total, page, totalPages };
    },

    /**
     * product — Devuelve un único producto por su ID.
     */
    product: async (_, { id }) => {
      if (!isValidId(id)) {
        throw new Error(`ID inválido: "${id}"`);
      }
      const product = await Product.findById(id).lean();
      if (!product) {
        throw new Error(`Producto con ID "${id}" no encontrado.`);
      }
      return product;
    },

    /**
     * categories — Lista de todas las categorías distintas.
     */
    categories: async () => {
      const cats = await Product.distinct('category');
      return cats.sort();
    },
  },

  // ─────────────────────────────────────────────
  //  MUTATIONS
  // ─────────────────────────────────────────────
  Mutation: {
    /**
     * createProduct — Crea y persiste un nuevo producto.
     */
    createProduct: async (_, { input }) => {
      const product = new Product(input);
      await product.save();
      return product.toObject();
    },

    /**
     * updateProduct — Actualiza uno o más campos de un producto existente.
     * Solo actualiza los campos que se incluyen en el input (patch parcial).
     */
    updateProduct: async (_, { id, input }) => {
      if (!isValidId(id)) {
        throw new Error(`ID inválido: "${id}"`);
      }

      // Eliminar campos undefined para no sobreescribir con null
      const updates = Object.fromEntries(
        Object.entries(input).filter(([, v]) => v !== undefined && v !== null)
      );

      if (Object.keys(updates).length === 0) {
        throw new Error('Debes proporcionar al menos un campo para actualizar.');
      }

      // Validar rangos si se envían price o stock
      if (updates.price !== undefined && updates.price < 0) {
        throw new Error('El precio no puede ser negativo.');
      }
      if (updates.stock !== undefined && updates.stock < 0) {
        throw new Error('El stock no puede ser negativo.');
      }

      const updated = await Product.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true, lean: true }
      );

      if (!updated) {
        throw new Error(`Producto con ID "${id}" no encontrado.`);
      }

      return updated;
    },

    /**
     * deleteProduct — Elimina un producto por ID. Devuelve true si se eliminó.
     */
    deleteProduct: async (_, { id }) => {
      if (!isValidId(id)) {
        throw new Error(`ID inválido: "${id}"`);
      }

      const result = await Product.findByIdAndDelete(id);
      if (!result) {
        throw new Error(`Producto con ID "${id}" no encontrado.`);
      }

      return true;
    },

    /**
     * updateStock — Ajusta el stock de un producto sumando (o restando si negativo) quantity.
     * El stock resultante no puede ser negativo.
     */
    updateStock: async (_, { id, quantity }) => {
      if (!isValidId(id)) {
        throw new Error(`ID inválido: "${id}"`);
      }

      const product = await Product.findById(id);
      if (!product) {
        throw new Error(`Producto con ID "${id}" no encontrado.`);
      }

      const newStock = product.stock + quantity;
      if (newStock < 0) {
        throw new Error(
          `Stock insuficiente. Stock actual: ${product.stock}, ajuste solicitado: ${quantity}.`
        );
      }

      product.stock = newStock;
      await product.save();
      return product.toObject();
    },
  },
};

module.exports = resolvers;
