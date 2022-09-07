export const API_ROUTES = {
  HOME: '/',
  WEBHOOKS: {
    INDEX: '/api/webhooks',
  },
  AUTH: {
    INDEX: '/api/auth',
    CALLBACK: '/api/auth/callback',
  },
  PRODUCTS: {
    COUNT: '/api/products/count',
    CREATE: '/api/products/create',
  },
} as const;
