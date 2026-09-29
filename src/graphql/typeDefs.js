const { gql } = require('graphql-tag');

/**
 * Definición del esquema GraphQL en SDL (Schema Definition Language).
 *
 * Tipos:
 *  - Product       → Representa un producto en la base de datos.
 *  - ProductFilter → Parámetros de filtrado opcionales para la query "products".
 *  - UpdateProductInput → Campos actualizables vía mutación.
 *
 * Queries:
 *  - products(filter, limit, offset, sortBy, sortOrder) → Lista paginada y filtrada.
 *  - product(id)                                        → Un producto por ID.
 *  - categories                                         → Lista de categorías únicas.
 *
 * Mutations:
 *  - createProduct(input)         → Crea un nuevo producto.
 *  - updateProduct(id, input)     → Actualiza campos de un producto existente.
 *  - deleteProduct(id)            → Elimina un producto por ID.
 *  - updateStock(id, quantity)    → Ajusta el stock (suma o resta).
 */
const typeDefs = gql`
  # ─────────────────────────────────────────────
  #  Tipo principal
  # ─────────────────────────────────────────────
  type Product {
    id: ID!
    name: String!
    price: Float!
    stock: Int!
    category: String!
    description: String
    createdAt: String
    updatedAt: String
  }

  # ─────────────────────────────────────────────
  #  Tipos de respuesta paginada
  # ─────────────────────────────────────────────
  type ProductsResult {
    "Lista de productos devueltos"
    products: [Product!]!
    "Total de productos que coinciden con el filtro (sin paginación)"
    total: Int!
    "Página actual (basada en offset/limit)"
    page: Int!
    "Total de páginas disponibles"
    totalPages: Int!
  }

  # ─────────────────────────────────────────────
  #  Inputs
  # ─────────────────────────────────────────────
  input ProductFilter {
    "Busca en nombre y descripción (búsqueda de texto completo)"
    search: String
    "Filtra por categoría exacta"
    category: String
    "Precio mínimo"
    minPrice: Float
    "Precio máximo"
    maxPrice: Float
    "Solo productos con stock > 0"
    inStock: Boolean
  }

  input CreateProductInput {
    name: String!
    price: Float!
    stock: Int!
    category: String!
    description: String
  }

  input UpdateProductInput {
    "Nuevo nombre del producto"
    name: String
    "Nuevo precio (debe ser >= 0)"
    price: Float
    "Nuevo stock (debe ser >= 0)"
    stock: Int
    "Nueva categoría"
    category: String
    "Nueva descripción"
    description: String
  }

  # ─────────────────────────────────────────────
  #  Queries
  # ─────────────────────────────────────────────
  type Query {
    "Obtiene todos los productos con filtros opcionales y paginación"
    products(
      filter: ProductFilter
      limit: Int = 20
      offset: Int = 0
      sortBy: String = "createdAt"
      sortOrder: String = "desc"
    ): ProductsResult!

    "Obtiene un único producto por su ID"
    product(id: ID!): Product

    "Lista todas las categorías únicas disponibles"
    categories: [String!]!
  }

  # ─────────────────────────────────────────────
  #  Mutations
  # ─────────────────────────────────────────────
  type Mutation {
    "Crea un nuevo producto"
    createProduct(input: CreateProductInput!): Product!

    "Actualiza uno o más campos de un producto existente"
    updateProduct(id: ID!, input: UpdateProductInput!): Product!

    "Elimina un producto por su ID"
    deleteProduct(id: ID!): Boolean!

    "Ajusta el stock de un producto (puede ser positivo o negativo)"
    updateStock(id: ID!, quantity: Int!): Product!
  }
`;

module.exports = typeDefs;
