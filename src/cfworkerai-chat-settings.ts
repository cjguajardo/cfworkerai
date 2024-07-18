// https://developers.cloudflare.com/workers-ai/models/
export type CFWorkerAIChatModelId =
  | '@cf/meta/llama-2-7b-chat-fp16'
  | '@cf/mistral/mistral-7b-instruct-v0.1'
  | '@cf/google/gemma-2b-it-lora'
  | '@hf/google/gemma-7b-it'
  | '@cf/meta/llama-3-8b-instruct-awq'
  | '@cf/defog/sqlcoder-7b-2'
  | ( string & {} );

export interface CFWorkerAIChatSettings {
  /**
Whether to inject a safety prompt before all conversations.

Defaults to `false`.
   */
  safePrompt?: boolean;

  use_rest?: boolean;
}
