/**
 * Client API pour communiquer avec le backend GirlyCrea
 */
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Pour les cookies (refresh token)
    });

    // Intercepteur pour ajouter le token d'authentification
    this.client.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les erreurs et refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        // Gestion des erreurs réseau (backend non accessible)
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          const networkError = new Error(
            `Impossible de se connecter au backend. Vérifiez que le serveur backend est lancé sur ${API_URL}`
          ) as any;
          networkError.isNetworkError = true;
          networkError.backendUrl = API_URL;
          return Promise.reject(networkError);
        }

        if (error.response?.status === 401 && typeof window !== 'undefined') {
          // Token expiré, essayer de refresh
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await axios.post(
                `${API_URL}/api/auth/refresh`,
                {},
                { withCredentials: true }
              );
              const { accessToken } = response.data as { accessToken: string };
              localStorage.setItem('accessToken', accessToken);
              // Retry la requête originale
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${accessToken}`;
                return this.client.request(error.config);
              }
            } catch (refreshError) {
              // Refresh échoué, déconnexion
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async register(data: { email: string; password: string; name: string; referralCode?: string }) {
    const response = await this.client.post('/api/auth/register', data);
    return response.data;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.client.post('/api/auth/login', data);
    return response.data;
  }

  async logout() {
    const response = await this.client.post('/api/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return response.data;
  }

  async getMe() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  // Products
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    q?: string;
  }) {
    const response = await this.client.get('/api/products', { params });
    return response.data;
  }

  async getProduct(id: string) {
    const response = await this.client.get(`/api/products/${id}`);
    return response.data;
  }

  async searchProducts(query: string, params?: { page?: number; limit?: number }) {
    const response = await this.client.get('/api/products/search', {
      params: { q: query, ...params },
    });
    return response.data;
  }

  // Orders
  async createOrder(data: {
    items: Array<{ productId: string; quantity: number; price: number }>;
    shippingAddress: any;
    billingAddress?: any;
  }) {
    const response = await this.client.post('/api/orders', data);
    return response.data;
  }

  async getOrders(params?: { page?: number; limit?: number; status?: string }) {
    const response = await this.client.get('/api/orders', { params });
    return response.data;
  }

  async getOrder(id: string) {
    const response = await this.client.get(`/api/orders/${id}`);
    return response.data;
  }

  // Cart (local storage pour MVP, à migrer vers backend si besoin)
  getCart() {
    if (typeof window === 'undefined') return [];
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  }

  setCart(cart: any[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }

  addToCart(product: { id: string; title: string; price: number; image?: string }, quantity: number = 1) {
    const cart = this.getCart();
    const existingItem = cart.find((item: any) => item.productId === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity,
      });
    }
    
    this.setCart(cart);
    return cart;
  }

  removeFromCart(productId: string) {
    const cart = this.getCart().filter((item: any) => item.productId !== productId);
    this.setCart(cart);
    return cart;
  }

  updateCartQuantity(productId: string, quantity: number) {
    const cart = this.getCart();
    const item = cart.find((item: any) => item.productId === productId);
    if (item) {
      if (quantity <= 0) {
        return this.removeFromCart(productId);
      }
      item.quantity = quantity;
    }
    this.setCart(cart);
    return cart;
  }

  clearCart() {
    this.setCart([]);
  }

  // CSRF Token
  async getCsrfToken() {
    const response = await this.client.get('/api/csrf-token');
    return response.data.csrfToken;
  }

  // Contact
  async sendContactMessage(data: { name: string; email: string; subject: string; message: string }) {
    const response = await this.client.post('/api/contact', data);
    return response.data;
  }

  // Exposer le client axios pour les appels personnalisés
  get axiosClient() {
    return this.client;
  }
}

export const api = new ApiClient();
export default api;

