
type CFWorkerRESTModel = {
  /**
  The language model must specify which language model interface
  version it implements. This will allow us to evolve the language
  model interface and retain backwards compatibility. The different
  implementation versions can be handled as a discriminated union
  on our side.
     */
  readonly specificationVersion: 'REST';
  /**
Name of the provider for logging purposes.
   */
  readonly provider: string;
  /**
Provider-specific model ID for logging purposes.
   */
  readonly modelId: string;
  /**
Default object generation mode that should be used with this model when
no mode is specified. Should be the mode with the best results for this
model. `undefined` can be returned if object generation is not supported.
 
This is needed to generate the best objects possible w/o requiring the
user to explicitly specify the object generation mode.
   */
  readonly defaultObjectGenerationMode: 'json' | undefined;
  /**
Generates a language model output (non-streaming).
 
Naming: "do" prefix to prevent accidental direct usage of the method
by the user.
   */
  doGenerate( options: LanguageModelV1CallOptions ): PromiseLike<{
    text?: string;

    prompt?: string;

    image?: Blob[];

    usage: {
      promptTokens: number;
      completionTokens: number;
    };
  }>;
}

export interface CFWorkerAISettings {
  /**
Whether to inject a safety prompt before all conversations.

Defaults to `false`.
   */
  safePrompt?: boolean;

  use_rest?: boolean;
}


export {
  CFWorkerRESTModel,
}