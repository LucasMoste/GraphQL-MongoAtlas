# API GraphQL de Productos — Apollo Server 5 + MongoDB Atlas

API GraphQL construida con **Apollo Server v5** y **MongoDB Atlas** (Mongoose).

## 🚀 Stack Tecnológico

| Tecnología     | Versión | Rol                      |
|----------------|---------|--------------------------|
| Node.js        | ≥ 18    | Runtime                  |
| Apollo Server  | 5.x     | Servidor GraphQL         |
| Mongoose       | 8.x     | ODM para MongoDB         |
| MongoDB Atlas  | —       | Base de datos en la nube |

---

## 📁 Estructura del Proyecto

```
ProductosVentas/
├── src/
│   ├── config/
│   │   └── db.js              # Conexión a MongoDB Atlas
│   ├── graphql/
│   │   ├── typeDefs.js        # Schema GraphQL (SDL)
│   │   └── resolvers.js       # Resolvers (queries + mutations)
│   ├── models/
│   │   └── Product.js         # Modelo Mongoose
│   └── index.js               # Punto de entrada del servidor
├── .env                       # Variables de entorno (NO commitear)
├── .env.example               # Plantilla de variables
├── .gitignore
├── package.json
└── render.yaml                # Configuración de despliegue en Render
```

---

## ⚙️ Configuración

Copiá el archivo `.env.example` y completá tus credenciales:

```bash
cp .env.example .env
```

```env
MONGODB_URI=mongodb+srv://USUARIO:PASSWORD@cluster.mongodb.net/productosDB?retryWrites=true&w=majority&appName=ClusterProductos
PORT=4000
NODE_ENV=development
```

> ⚠️ **Nunca subas el `.env` al repositorio.** Está en `.gitignore`.

---

## 🏃 Ejecución Local

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo (con hot-reload)
npm run dev

# Iniciar en producción
npm start
```

El servidor queda disponible en:
- **GraphQL endpoint:** `http://localhost:4000/`
- **Apollo Sandbox:** `http://localhost:4000/`

---

## 📡 Schema GraphQL

### Tipo `Product`

```graphql
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
```

### Queries disponibles

| Query | Parámetros | Descripción |
|---|---|---|
| `products` | `filter`, `limit`, `offset`, `sortBy`, `sortOrder` | Lista paginada con filtros |
| `product` | `id` | Un producto por ID |
| `categories` | — | Lista de categorías únicas |

### Mutations disponibles

| Mutation | Descripción |
|---|---|
| `createProduct(input)` | Crea un nuevo producto |
| `updateProduct(id, input)` | Actualiza campos de un producto |
| `deleteProduct(id)` | Elimina un producto |
| `updateStock(id, quantity)` | Ajusta el stock (suma o resta) |

---

## 🔍 Ejemplos de Queries

### Obtener todos los productos (paginado)

```graphql
query GetProducts {
  products(limit: 50) {
    products {
      id
      name
      price
      stock
      category
      description
    }
    total
    page
    totalPages
  }
}
```

### Filtrar productos

```graphql
query FilterProducts {
  products(
    filter: { category: "electronica", minPrice: 100, inStock: true }
    limit: 10
    offset: 0
    sortBy: "price"
    sortOrder: "asc"
  ) {
    products {
      id
      name
      price
      stock
    }
    total
    totalPages
  }
}
```

### Buscar por texto

```graphql
query SearchProducts {
  products(filter: { search: "bluetooth" }) {
    products {
      id
      name
      description
    }
    total
  }
}
```

### Obtener un producto por ID

```graphql
query GetProduct {
  product(id: "TU_PRODUCT_ID") {
    id
    name
    price
    stock
    category
    description
    createdAt
    updatedAt
  }
}
```

### Listar categorías

```graphql
query GetCategories {
  categories
}
```

---

## ✏️ Ejemplos de Mutations

### Crear producto

```graphql
mutation CreateProduct {
  createProduct(input: {
    name: "Nuevo Producto"
    price: 299.99
    stock: 20
    category: "Electronica"
    description: "Descripción del producto"
  }) {
    id
    name
    price
  }
}
```

### Actualizar un producto

```graphql
mutation UpdateProduct {
  updateProduct(
    id: "TU_PRODUCT_ID"
    input: { price: 249.99, stock: 15 }
  ) {
    id
    name
    price
    stock
    updatedAt
  }
}
```

### Ajustar stock

```graphql
mutation UpdateStock {
  updateStock(id: "TU_PRODUCT_ID", quantity: -5) {
    id
    name
    stock
  }
}
```

### Eliminar producto

```graphql
mutation DeleteProduct {
  deleteProduct(id: "TU_PRODUCT_ID")
}
```

---

## 🌐 Despliegue en Render

1. Subí el proyecto a un repositorio de GitHub
2. En [render.com](https://render.com), creá un nuevo **Web Service**
3. Conectá el repositorio
4. Render detectará automáticamente el `render.yaml`
5. En **Environment Variables**, agregá manualmente `MONGODB_URI` con tus credenciales reales
6. Hacé click en **Deploy**

> ⚠️ En el plan gratuito de Render, el servicio se pone en modo "sleep" tras 15 minutos de inactividad. El primer request tardará unos segundos en despertar.

---

## 🔒 Seguridad

- `.env` está en `.gitignore` — nunca se sube al repositorio
- Las variables de entorno en Render se cifran en reposo
- La introspección está habilitada (requerida para Apollo Sandbox)
- Para producción real, considerá deshabilitar la introspección y agregar autenticación JWT
