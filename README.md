# Vercel AI SDK - CFWorkerAI Provider

The **[CFWorkerAI provider](https://sdk.vercel.ai/providers/ai-sdk-providers/cfworkerai)** for the [Vercel AI SDK](https://sdk.vercel.ai/docs) contains language model support for the CFWorkerAI chat API.

## Setup

The CFWorkerAI provider is available in the `@cjguajardo/cfworkerai` module. You can install it with

```bash
npm i @cjguajardo/cfworkerai
```

## Provider Instance

You can import the default provider instance `cfworkerai` from `@cjguajardo/cfworkerai`:

```ts
import { cfworkerai } from '@cjguajardo/cfworkerai';
```

## Example

```ts
import { cfworkerai } from '@cjguajardo/cfworkerai';
import { generateText } from 'ai';

const { text } = await generateText({
  model: cfworkerai('@cf/meta/llama-2-7b-chat-fp16'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

## Documentation

<!-- Please check out the **[CFWorkerAI provider](https://sdk.vercel.ai/providers/ai-sdk-providers/cfworkerai)** for more information. -->
