# Vercel AI SDK - CFWorkerAI Provider

The **[CFWorkerAI provider](https://github.com/cjguajardo/cfworkerai/blob/main/README.md)** for the [Vercel AI SDK](https://sdk.vercel.ai/docs) contains language model support for the CFWorkerAI chat API.

More information about the Cloudflare AI Gateway can be found at: **[Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/get-started/)**


To see the available models, you can use the `cfworkerai` command: **[Available Models](https://developers.cloudflare.com/workers-ai/models/)**


## Important Note
This is currently a beta version of the CFWorkerAI provider. If you encounter any issues, please open an issue on the **[GitHub repository](https://github.com/cjguajardo/cfworkerai/issues)**.

## Setup

The CFWorkerAI provider is available in the `cjguajardo/cfworkerai` module. You can install it with

```bash
npm i cjguajardo/cfworkerai
```

Once installed, you have to setup the environment variables `CF_TOKEN` and `CF_BASE_URL`:

```bash
CF_TOKEN=YOUR_CLOUDFLARE_TOKEN
CF_BASE_URL=YOUR_CLOUDFLARE_GATEWAY_AI_URL
```

Your Cloudflare token can be found at: **[Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)**


## Provider Instance

You can import the default provider instance `cfworkerai` from `cjguajardo/cfworkerai`:

```ts
import { cfworkerai } from 'cjguajardo/cfworkerai';
```

## Example

```ts
import { cfworkerai } from 'cjguajardo/cfworkerai';
import { generateText } from 'ai';

const { text } = await generateText({
  model: cfworkerai('@cf/meta/llama-2-7b-chat-fp16'),
  prompt: 'Write a vegetarian lasagna recipe for 4 people.',
});
```

<!-- ## Documentation -->

<!-- Please check out the **[CFWorkerAI provider](https://github.com/cjguajardo/cfworkerai/blob/main/README.md)** for more information. -->
