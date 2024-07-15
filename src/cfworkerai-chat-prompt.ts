export type CFWorkerAIChatPrompt = Array<CFWorkerAIChatMessage>;

export type CFWorkerAIChatMessage =
  | CFWorkerAISystemMessage
  | CFWorkerAIUserMessage
  | CFWorkerAIAssistantMessage
  | CFWorkerAIToolMessage;

export interface CFWorkerAISystemMessage {
  role: 'system';
  content: string;
}

export interface CFWorkerAIUserMessage {
  role: 'user';
  content: string;
}

export interface CFWorkerAIAssistantMessage {
  role: 'assistant';
  content: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
}

export interface CFWorkerAIToolMessage {
  role: 'tool';
  name: string;
  content: string;
}