# Backend Modules Description

## Core Modules

### Auth Module
- **Purpose**: Manages user authentication and authorization.
- **Endpoints**: Login, Register, Refresh Token.
- **Components**: AuthController, AuthService, AuthRepository, JWT Strategy.

### Users Module
- **Purpose**: User management and profile operations.
- **Components**: UsersController, UsersService, UsersRepository.

### Products Module
- **Purpose**: Product catalog management.
- **Components**: ProductsController, ProductsService, ProductsRepository.

### Categories Module
- **Purpose**: Product categorization hierarchy.
- **Components**: CategoriesController, CategoriesService, CategoriesRepository.

### Orders Module
- **Purpose**: Order processing and lifecycle management.
- **Components**: OrdersController, OrdersService, OrdersRepository.

### Cart Module
- **Purpose**: Shopping cart management.
- **Components**: CartController, CartService, CartRepository.

### Recommendations Module
- **Purpose**: Intelligent product recommendation engine.
- **Pattern**: Strategy Pattern (Popularity, User History).
- **Components**: RecommendationsController, RecommendationsService, Strategies.

### Health Module
- **Purpose**: System health monitoring.
- **Endpoint**: GET /health.
