import {
  LanguageModelV1CallWarning,
} from '@ai-sdk/provider';
import { CFWorkerRESTModel } from './cfworkerai-types';
import {
  ParseResult,
  combineHeaders,
  createEventSourceResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from '@ai-sdk/provider-utils';
import { z } from 'zod';
import {
  CFWorkerAIRESTModelId,
  CFWorkerAIRESTSettings,
} from './cfworkerai-rest-settings';
import { cfworkeraiFailedResponseHandler } from './cfworkerai-error';
import { convertToCFWorkerAIRESTInput } from './convert-to-cfworkerai-rest-input';

type CFWorkerAIRESTConfig = {
  provider: string;
  baseURL: string;
  headers: () => Record<string, string | undefined>;
  generateId: () => string;
  fetch?: typeof fetch;
};

export class CFWorkerAIRESTModel implements CFWorkerRESTModel {
  readonly specificationVersion = 'REST';
  readonly defaultObjectGenerationMode = 'json';

  readonly modelId: CFWorkerAIRESTModelId;
  readonly settings: CFWorkerAIRESTSettings;

  private readonly config: CFWorkerAIRESTConfig;

  constructor(
    modelId: CFWorkerAIRESTModelId,
    settings: CFWorkerAIRESTSettings,
    config: CFWorkerAIRESTConfig,
  ) {
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }

  get provider(): string {
    return this.config.provider;
  }

  private getArgs( {
    mode,
    prompt,
  }: Parameters<CFWorkerRESTModel['doGenerate']>[0] ) {
    const type = mode.type;

    const warnings: LanguageModelV1CallWarning[] = [];

    const baseArgs = {
      // model id:
      model: this.modelId,

      // model specific settings:
      safe_prompt: this.settings.safePrompt,

      // input prompt:
      prompt: prompt,

    };

    const restArgs = convertToCFWorkerAIRESTInput( prompt );

    switch ( type ) {
      case 'regular': {
        return {
          args: { ...baseArgs, ...restArgs },
          warnings,
        };
      }

      case 'object-json': {
        return {
          args: {
            ...baseArgs,
            ...restArgs,
            response_format: { type: 'json_object' },
          },
          warnings,
        };
      }

      default: {
        throw new Error( `Unsupported type: ${type}` );
      }
    }
  }

  async doGenerate(
    options: Parameters<CFWorkerRESTModel['doGenerate']>[0],
  ): Promise<Awaited<ReturnType<CFWorkerRESTModel['doGenerate']>>> {
    const { args } = this.getArgs( options );

    const result = await postJsonToApi( {
      url: `${this.config.baseURL}/${this.modelId}`,
      headers: combineHeaders( this.config.headers(), options.headers ),
      body: args,
      failedResponseHandler: cfworkeraiFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        cfworkeraiRESTResponseSchema,
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch,
    } );

    const { value: response } = result;

    return {
      text: response.result.description ?? undefined,
      usage: { promptTokens: 0, completionTokens: 0 },
    };
  }


}

// limited version of the schema, focussed on what is needed for the implementation
// this approach limits breakages when the API changes and increases efficiency
const cfworkeraiRESTResponseSchema = z.object( {
  result: z.object( {
    description: z.string(),
  } ),
  success: z.boolean(),
  errors: z.array( z.string() ),
  messages: z.array( z.string() ),
} );
