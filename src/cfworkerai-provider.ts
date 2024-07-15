import {
  generateId,
  loadApiKey, loadSetting,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';
import { CFWorkerAIChatLanguageModel } from './cfworkerai-chat-language-model';
import {
  CFWorkerAIChatModelId,
  CFWorkerAIChatSettings,
} from './cfworkerai-chat-settings';
import {
  CFWorkerAIEmbeddingModelId,
  CFWorkerAIEmbeddingSettings,
} from './cfworkerai-embedding-settings';
import { CFWorkerAIEmbeddingModel } from './cfworkerai-embedding-model';

export interface CFWorkerAIProvider {
  (
    modelId: CFWorkerAIChatModelId,
    settings?: CFWorkerAIChatSettings,
  ): CFWorkerAIChatLanguageModel;

  /**
Creates a model for text generation.
*/
  languageModel(
    modelId: CFWorkerAIChatModelId,
    settings?: CFWorkerAIChatSettings,
  ): CFWorkerAIChatLanguageModel;

  /**
Creates a model for text generation.
*/
  chat(
    modelId: CFWorkerAIChatModelId,
    settings?: CFWorkerAIChatSettings,
  ): CFWorkerAIChatLanguageModel;

  /**
Creates a model for text embeddings.
   */
  embedding(
    modelId: CFWorkerAIEmbeddingModelId,
    settings?: CFWorkerAIEmbeddingSettings,
  ): CFWorkerAIEmbeddingModel;

  /**
Creates a model for text embeddings.
   */
  textEmbedding(
    modelId: CFWorkerAIEmbeddingModelId,
    settings?: CFWorkerAIEmbeddingSettings,
  ): CFWorkerAIEmbeddingModel;
}

export interface CFWorkerAIProviderSettings {
  /**
Use a different URL prefix for API calls, e.g. to use proxy servers.
The default prefix is `https://api.cfworkerai.ai/v1`.
   */
  baseURL?: string;

  /**
@deprecated Use `baseURL` instead.
   */
  baseUrl?: string;

  /**
API key that is being send using the `Authorization` header.
It defaults to the `CFWORKERAI_API_KEY` environment variable.
   */
  apiKey?: string;

  /**
Custom headers to include in the requests.
     */
  headers?: Record<string, string>;

  /**
Custom fetch implementation. You can use it as a middleware to intercept requests,
or to provide a custom fetch implementation for e.g. testing.
    */
  fetch?: typeof fetch;

  generateId?: () => string;
}

/**
Create a CFWorkerAI AI provider instance.
 */
export function createCFWorkerAI(
  options: CFWorkerAIProviderSettings = {},
): CFWorkerAIProvider {
  if ( !options.baseURL ) {
    if ( !process.env.CF_BASE_URL ) {
      throw new Error(
        'The CF_BASE_URL environment variable must be set to use the custom provider.',
      );
    }
  }

  const baseURL = loadSetting( {
    settingName: 'baseURL',
    settingValue: withoutTrailingSlash( options.baseURL ),
    environmentVariableName: 'CF_BASE_URL',
    description: 'Cloudflare gateway Provider Base URL',
  } )

  const getHeaders = () => ( {
    Authorization: `Bearer ${loadApiKey( {
      apiKey: options.apiKey,
      environmentVariableName: 'CF_TOKEN',
      description: 'Cloudflare API token',
    } )}`,
    ...options.headers,
  } );

  const createChatModel = (
    modelId: CFWorkerAIChatModelId,
    settings: CFWorkerAIChatSettings = {},
  ) =>
    new CFWorkerAIChatLanguageModel( modelId, settings, {
      provider: 'cfworkerai.chat',
      baseURL,
      headers: getHeaders,
      generateId: options.generateId ?? generateId,
      fetch: options.fetch,
    } );

  const createEmbeddingModel = (
    modelId: CFWorkerAIEmbeddingModelId,
    settings: CFWorkerAIEmbeddingSettings = {},
  ) =>
    new CFWorkerAIEmbeddingModel( modelId, settings, {
      provider: 'cfworkerai.embedding',
      baseURL,
      headers: getHeaders,
      fetch: options.fetch,
    } );

  const provider = function (
    modelId: CFWorkerAIChatModelId,
    settings?: CFWorkerAIChatSettings,
  ) {
    if ( new.target ) {
      throw new Error(
        'The CFWorkerAI model function cannot be called with the new keyword.',
      );
    }

    return createChatModel( modelId, settings );
  };

  provider.languageModel = createChatModel;
  provider.chat = createChatModel;
  provider.embedding = createEmbeddingModel;
  provider.textEmbedding = createEmbeddingModel;

  return provider as CFWorkerAIProvider;
}

/**
Default CFWorkerAI provider instance.
 */
export const cfworkerai = createCFWorkerAI();