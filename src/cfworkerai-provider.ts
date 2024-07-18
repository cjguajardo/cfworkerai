import {
  generateId,
  loadApiKey, loadSetting,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';
import { CFWorkerAIChatLanguageModel } from './cfworkerai-chat-language-model';
import { CFWorkerAIChatModelId } from './cfworkerai-chat-settings';
import { CFWorkerAISettings } from './cfworkerai-types';
import {
  CFWorkerAIEmbeddingModelId,
  CFWorkerAIEmbeddingSettings,
} from './cfworkerai-embedding-settings';
import { CFWorkerAIEmbeddingModel } from './cfworkerai-embedding-model';
import { CFWorkerAIRESTModel } from './cfworkerai-rest-model';
import { CFWorkerAIRESTModelId, CFWorkerAIRESTSettings } from './cfworkerai-rest-settings';

export interface CFWorkerAIProvider {
  (
    modelId: CFWorkerAIChatModelId,
    settings?: CFWorkerAISettings,
  ): CFWorkerAIChatLanguageModel;

  /**
Creates a model for text generation.
*/
  languageModel(
    modelId: CFWorkerAIChatModelId,
    settings?: CFWorkerAISettings,
  ): CFWorkerAIChatLanguageModel;

  /**
Creates a model for text generation.
*/
  chat(
    modelId: CFWorkerAIChatModelId,
    settings?: CFWorkerAISettings,
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

  rest(
    modelId: CFWorkerAIRESTModelId,
    settings?: CFWorkerAIRESTSettings,
  ): CFWorkerAIRESTModel;
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
    settings: CFWorkerAISettings = {},
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

  const createRESTModel = (
    modelId: CFWorkerAIChatModelId,
    settings: CFWorkerAIRESTSettings = {},
  ) => new CFWorkerAIRESTModel( modelId, settings,
    {
      provider: 'cfworkerai.rest',
      baseURL,
      headers: getHeaders,
      generateId: options.generateId ?? generateId,
      fetch: options.fetch,
    } );

  const provider = function (
    modelId: CFWorkerAIChatModelId,
    settings?: CFWorkerAISettings,
  ) {
    if ( new.target ) {
      throw new Error(
        'The CFWorkerAI model function cannot be called with the new keyword.',
      );
    }

    if ( settings?.use_rest === true ) {
      return createRESTModel( modelId, settings );
    }

    return createChatModel( modelId, settings );
  };

  provider.languageModel = createChatModel;
  provider.chat = createChatModel;
  provider.embedding = createEmbeddingModel;
  provider.textEmbedding = createEmbeddingModel;
  provider.rest = createRESTModel;

  return provider as CFWorkerAIProvider;
}

/**
Default CFWorkerAI provider instance.
 */
export const cfworkerai = createCFWorkerAI();
