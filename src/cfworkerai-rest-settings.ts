// https://developers.cloudflare.com/workers-ai/models/
export type CFWorkerAIRESTModelId =
  | '@cf/llava-hf/llava-1.5-7b-hf'
  | '@cf/unum/uform-gen2-qwen-500m'
  | '@cf/openai/whisper'
  | '@cf/openai/whisper-tiny-en'
  | ( string & {} );

export interface CFWorkerAIRESTSettings {
  /**
Whether to inject a safety prompt before all conversations.

Defaults to `false`.
   */
  safePrompt?: boolean;

  image?: Blob[];
}
