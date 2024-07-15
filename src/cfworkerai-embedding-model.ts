import {
  EmbeddingModelV1,
  TooManyEmbeddingValuesForCallError,
} from '@ai-sdk/provider';
import {
  combineHeaders,
  createJsonResponseHandler,
  postJsonToApi,
} from '@ai-sdk/provider-utils';
import { z } from 'zod';
import {
  CFWorkerAIEmbeddingModelId,
  CFWorkerAIEmbeddingSettings,
} from './cfworkerai-embedding-settings';
import { cfworkeraiFailedResponseHandler } from './cfworkerai-error';

type CFWorkerAIEmbeddingConfig = {
  provider: string;
  baseURL: string;
  headers: () => Record<string, string | undefined>;
  fetch?: typeof fetch;
};

export class CFWorkerAIEmbeddingModel implements EmbeddingModelV1<string> {
  readonly specificationVersion = 'v1';
  readonly modelId: CFWorkerAIEmbeddingModelId;

  private readonly config: CFWorkerAIEmbeddingConfig;
  private readonly settings: CFWorkerAIEmbeddingSettings;

  get provider(): string {
    return this.config.provider;
  }

  get maxEmbeddingsPerCall(): number {
    return this.settings.maxEmbeddingsPerCall ?? 32;
  }

  get supportsParallelCalls(): boolean {
    // Parallel calls are technically possible,
    // but I have been hitting rate limits and disable them for now.
    return this.settings.supportsParallelCalls ?? false;
  }

  constructor(
    modelId: CFWorkerAIEmbeddingModelId,
    settings: CFWorkerAIEmbeddingSettings,
    config: CFWorkerAIEmbeddingConfig,
  ) {
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }

  async doEmbed( {
    values,
    abortSignal,
    headers,
  }: Parameters<EmbeddingModelV1<string>['doEmbed']>[0] ): Promise<
    Awaited<ReturnType<EmbeddingModelV1<string>['doEmbed']>>
  > {
    if ( values.length > this.maxEmbeddingsPerCall ) {
      throw new TooManyEmbeddingValuesForCallError( {
        provider: this.provider,
        modelId: this.modelId,
        maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
        values,
      } );
    }

    const { responseHeaders, value: response } = await postJsonToApi( {
      url: `${this.config.baseURL}/embeddings`,
      headers: combineHeaders( this.config.headers(), headers ),
      body: {
        model: this.modelId,
        input: values,
        encoding_format: 'float',
      },
      failedResponseHandler: cfworkeraiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        CFWorkerAITextEmbeddingResponseSchema,
      ),
      abortSignal,
      fetch: this.config.fetch,
    } );

    return {
      embeddings: response.data.map( item => item.embedding ),
      usage: response.usage
        ? { tokens: response.usage.prompt_tokens }
        : undefined,
      rawResponse: { headers: responseHeaders },
    };
  }
}

// minimal version of the schema, focussed on what is needed for the implementation
// this approach limits breakages when the API changes and increases efficiency
const CFWorkerAITextEmbeddingResponseSchema = z.object( {
  data: z.array( z.object( { embedding: z.array( z.number() ) } ) ),
  usage: z.object( { prompt_tokens: z.number() } ).nullish(),
} );
