# Vercel AI SDK - CFWorkerAI Provider

The **[CFWorkerAI provider](https://github.com/cfworkerai/blob/main/README.md)** for the [Vercel AI SDK](https://sdk.vercel.ai/docs) contains language model support for the CFWorkerAI chat API.

More information about the Cloudflare AI Gateway can be found at: **[Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/get-started/)**


All available models can be found at: **[Available Models](https://developers.cloudflare.com/workers-ai/models/)**


## Important Note
This is currently a beta version of the CFWorkerAI provider. If you encounter any issues, please open an issue on the **[GitHub repository](https://github.com/cfworkerai/issues)**.

## Setup

The CFWorkerAI provider is available in the `cfworkerai` module. You can install it with

```bash
npm i cfworkerai
```

Once installed, you have to setup the environment variables `CF_TOKEN` and `CF_BASE_URL`:

```bash
CF_TOKEN=YOUR_CLOUDFLARE_TOKEN
CF_BASE_URL=https://gateway.ai.cloudflare.com/v1/{CLOUDFLARE_ACCOUNT_ID}/{GATEWAY_ID}/workers-ai/v1
```

Your Cloudflare token can be found at: **[Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)**


## Provider Instance

You can import the default provider instance `cfworkerai` from `cfworkerai`:

```ts
import { cfworkerai } from 'cfworkerai';
```

## Example

```ts
import { cfworkerai } from 'cfworkerai';
import { generateText } from 'ai';

const result1 = await generateText({
  model: cfworkerai('@cf/meta/llama-2-7b-chat-fp16'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});

const result2 = await streamText( {
    model: cfworkerai( '@cf/google/gemma-2b-it-lora' ),
    messages: [
        { role: 'system', content: 'You are a helpful AI assistant.' },
        { role: 'user', content: 'What is the capital of France?' },
        { role: 'assistant', content: 'Paris is the capital of France.' },
    ],
  } );
```

<!-- ## Documentation -->

<!-- Please check out the **[CFWorkerAI provider](https://github.com/cfworkerai/blob/main/README.md)** for more information. -->
