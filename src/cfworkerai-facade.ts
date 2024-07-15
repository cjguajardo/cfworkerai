import {
  generateId,
  loadApiKey,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';
import { CFWorkerAIChatLanguageModel } from './cfworkerai-chat-language-model';
import {
  CFWorkerAIChatModelId,
  CFWorkerAIChatSettings,
} from './cfworkerai-chat-settings';
import { CFWorkerAIProviderSettings } from './cfworkerai-provider';

/**
 * @deprecated Use `createCFWorkerAI` instead.
 */
export class CFWorkerAI {
  /**
   * Base URL for the CFWorkerAI API calls.
   */
  readonly baseURL: string;

  readonly apiKey?: string;

  readonly headers?: Record<string, string>;

  private readonly generateId: () => string;

  /**
   * Creates a new CFWorkerAI provider instance.
   */
  constructor( options: CFWorkerAIProviderSettings = {} ) {
    this.baseURL =
      withoutTrailingSlash( options.baseURL ?? options.baseUrl ) ??
      'https://api.cfworkerai.ai/v1';

    this.apiKey = options.apiKey;
    this.headers = options.headers;
    this.generateId = options.generateId ?? generateId;
  }

  private get baseConfig() {
    return {
      baseURL: this.baseURL,
      headers: () => ( {
        Authorization: `Bearer ${loadApiKey( {
          apiKey: this.apiKey,
          environmentVariableName: 'CFWORKERAI_API_KEY',
          description: 'CFWorkerAI',
        } )}`,
        ...this.headers,
      } ),
    };
  }

  chat( modelId: CFWorkerAIChatModelId, settings: CFWorkerAIChatSettings = {} ) {
    return new CFWorkerAIChatLanguageModel( modelId, settings, {
      provider: 'cfworkerai.chat',
      ...this.baseConfig,
      generateId: this.generateId,
    } );
  }
}
