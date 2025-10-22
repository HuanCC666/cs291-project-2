import type {
  AuthService,
  RegisterRequest,
  User,
  AuthServiceConfig,
} from '@/types';
import TokenManager from '@/services/TokenManager';

/**
 * API-based implementation of AuthService
 * Uses fetch for HTTP requests
 */
export class ApiAuthService implements AuthService {
  private baseUrl: string;
  private tokenManager: TokenManager;

  constructor(config: AuthServiceConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost:3000';
    this.tokenManager = TokenManager.getInstance();
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // TODO: Implement the makeRequest helper method
    // This should:
    // 1. Construct the full URL using this.baseUrl and endpoint
    // 2. Set up default headers including 'Content-Type': 'application/json'
    // 3. Use {credentials: 'include'} for session cookies
    // 4. Make the fetch request with the provided options
    // 5. Handle non-ok responses by throwing an error with status and message
    // 6. Return the parsed JSON response
    // TODO: Implement the makeRequest helper method
    const url =
      (this.baseUrl.replace(/\/+$/, '') + '/' + endpoint.replace(/^\/+/, ''));

    const headers = new Headers(options.headers ?? {});

    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }


    const token = this.tokenManager.getToken?.();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(url, {
      credentials: 'include',     
      ...options,
      headers,
    });

    const text = await res.text();
    const data = text ? (() => { try { return JSON.parse(text); } catch { return text; } })() : null;

    if (!res.ok) {
      const message = (data && (data.message || data.error)) || `${res.status} ${res.statusText}`;
      const err: any = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;                  
    }

    return data as T;            
  }

  async login(username: string, password: string): Promise<User> {
    // TODO: Implement login method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Store the token using this.tokenManager.setToken(response.token)
    // 3. Return the user object
    //
    // See API_SPECIFICATION.md for endpoint details

    // TODO: Implement login method
    const resp = await this.makeRequest<{ token?: string; user?: User }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }
     );

 
    if (resp?.token) {
      this.tokenManager.setToken(resp.token);
    }


    if (resp?.user) {
      return resp.user;
    }
    const me = await this.getCurrentUser();
    if (!me) {
      throw new Error('Failed to fetch current user after login');
    }
    return me;

  }

  async register(userData: RegisterRequest): Promise<User> {
    // TODO: Implement register method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Store the token using this.tokenManager.setToken(response.token)
    // 3. Return the user object
    //
    // See API_SPECIFICATION.md for endpoint details
    // TODO: Implement register method
    const resp = await this.makeRequest<{ token?: string; user?: User }>(
      '/auth/register',
      {
       method: 'POST',
       body: JSON.stringify(userData),
      }
    );

    if (resp?.token) this.tokenManager.setToken(resp.token);
    if (resp?.user) return resp.user;

    const me = await this.getCurrentUser();
    if (!me) throw new Error('Failed to fetch current user after register');
    return me;
  }

  async logout(): Promise<void> {
    // TODO: Implement logout method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Handle errors gracefully (continue with logout even if API call fails)
    // 3. Clear the token using this.tokenManager.clearToken()
    //
    // See API_SPECIFICATION.md for endpoint details

    try {
      await this.makeRequest('/auth/logout', { method: 'POST' });
    } catch {
 
    } finally {
      this.tokenManager.clearToken();
    }
  }

  async refreshToken(): Promise<User> {
    // TODO: Implement refreshToken method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 3. Update the stored token using this.tokenManager.setToken(response.token)
    // 4. Return the user object
    //
    // See API_SPECIFICATION.md for endpoint details

   // TODO: Implement refreshToken method
    const resp = await this.makeRequest<{ token?: string; user?: User }>(
      '/auth/refresh',
      { method: 'POST' }
    );

    if (resp?.token) this.tokenManager.setToken(resp.token);
    if (resp?.user) return resp.user;

    const me = await this.getCurrentUser();
    if (!me) throw new Error('Failed to fetch current user after refresh');
    return me;

  }

  async getCurrentUser(): Promise<User | null> {
    // TODO: Implement getCurrentUser method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Return the user object if successful
    // 3. If the request fails (e.g., session invalid), clear the token and return null
    //
    // See API_SPECIFICATION.md for endpoint details

    try {
      const me = await this.makeRequest<User>('/auth/me', { method: 'GET' });
      return me ?? null;
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        this.tokenManager.clearToken();
        return null;
      }
      throw err;
    }
  }
}
