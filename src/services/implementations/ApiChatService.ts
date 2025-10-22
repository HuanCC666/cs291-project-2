import type { ChatService } from '@/types';
import type {
  Conversation,
  CreateConversationRequest,
  UpdateConversationRequest,
  Message,
  SendMessageRequest,
  ExpertProfile,
  ExpertQueue,
  ExpertAssignment,
  UpdateExpertProfileRequest,
} from '@/types';
import TokenManager from '@/services/TokenManager';

interface ApiChatServiceConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

/**
 * API implementation of ChatService for production use
 * Uses fetch for HTTP requests
 */
export class ApiChatService implements ChatService {
  private baseUrl: string;
  private tokenManager: TokenManager;

  constructor(config: ApiChatServiceConfig) {
    this.baseUrl = config.baseUrl;
    this.tokenManager = TokenManager.getInstance();
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // TODO: Implement the makeRequest helper method
    // This should:
    // 1. Construct the full URL using this.baseUrl and endpoint
    // 2. Get the token using this.tokenManager.getToken()
    // 3. Set up default headers including 'Content-Type': 'application/json'
    // 4. Add Authorization header with Bearer token if token exists
    // 5. Make the fetch request with the provided options
    // 6. Handle non-ok responses by throwing an error with status and message
    // 7. Return the parsed JSON response

    const url = this.baseUrl.replace(/\/+$/, '') + '/' + endpoint.replace(/^\/+/, '');

    const headers = new Headers(options.headers ?? {});
    // 仅在有 body 时默认 JSON
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
   }

    // 带上 Bearer token（如有）
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

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    // TODO: Implement getConversations method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Return the array of conversations
    //
    // See API_SPECIFICATION.md for endpoint details

    return await this.makeRequest<Conversation[]>('/conversations', { method: 'GET' });
  }

  async getConversation(_id: string): Promise<Conversation> {
    // TODO: Implement getConversation method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Return the conversation object
    //
    // See API_SPECIFICATION.md for endpoint details

    return await this.makeRequest<Conversation>(`/conversations/${_id}`, { method: 'GET' });
  }

  async createConversation(
    request: CreateConversationRequest
  ): Promise<Conversation> {
    // TODO: Implement createConversation method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Return the created conversation object
    //
    // See API_SPECIFICATION.md for endpoint details

    return await this.makeRequest<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateConversation(
    id: string,
    request: UpdateConversationRequest
  ): Promise<Conversation> {
    // SKIP, not currently used by application

    throw new Error('updateConversation method not implemented');
  }

  async deleteConversation(id: string): Promise<void> {
    // SKIP, not currently used by application

    throw new Error('deleteConversation method not implemented');
  }

  // Messages
  async getMessages(conversationId: string): Promise<Message[]> {
    // TODO: Implement getMessages method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Return the array of messages
    //
    // See API_SPECIFICATION.md for endpoint details

    return await this.makeRequest<Message[]>(`/conversations/${conversationId}/messages`, {
      method: 'GET',
    });
  }

  async sendMessage(request: SendMessageRequest): Promise<Message> {
    // TODO: Implement sendMessage method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Return the created message object
    //
    // See API_SPECIFICATION.md for endpoint details

    // TODO: Implement sendMessage method
    return await this.makeRequest<Message>(`/conversations/${request.conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(request),
    });

  }

  async markMessageAsRead(messageId: string): Promise<void> {
    // SKIP, not currently used by application

    throw new Error('markMessageAsRead method not implemented');
  }

  // Expert-specific operations
  async getExpertQueue(): Promise<ExpertQueue> {
    // TODO: Implement getExpertQueue method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Return the expert queue object with waitingConversations and assignedConversations
    //
    // See API_SPECIFICATION.md for endpoint details

    
    return await this.makeRequest<ExpertQueue>('/experts/queue', { method: 'GET' });

  }

  async claimConversation(conversationId: string): Promise<void> {
    // TODO: Implement claimConversation method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Return void (no response body expected)
    //
    // See API_SPECIFICATION.md for endpoint details

    await this.makeRequest<void>(`/experts/conversations/${conversationId}/claim`, {
      method: 'POST',
    });
  }

  async unclaimConversation(conversationId: string): Promise<void> {
    // TODO: Implement unclaimConversation method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Return void (no response body expected)
    //
    // See API_SPECIFICATION.md for endpoint details

    await this.makeRequest<void>(`/experts/conversations/${conversationId}/unclaim`, {
      method: 'POST',
    });
  }

  async getExpertProfile(): Promise<ExpertProfile> {
    // TODO: Implement getExpertProfile method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Return the expert profile object
    //
    // See API_SPECIFICATION.md for endpoint details

    return await this.makeRequest<ExpertProfile>('/experts/me', { method: 'GET' });
  }

  async updateExpertProfile(
    request: UpdateExpertProfileRequest
  ): Promise<ExpertProfile> {
    // TODO: Implement updateExpertProfile method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Return the updated expert profile object
    //
    // See API_SPECIFICATION.md for endpoint details

    return await this.makeRequest<ExpertProfile>('/experts/me', {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  async getExpertAssignmentHistory(): Promise<ExpertAssignment[]> {
    // TODO: Implement getExpertAssignmentHistory method
    // This should:
    // 1. Make a request to the appropriate endpoint
    // 2. Return the array of expert assignments
    //
    // See API_SPECIFICATION.md for endpoint details

    return await this.makeRequest<ExpertAssignment[]>('/experts/assignments', { method: 'GET' });
  }
}
