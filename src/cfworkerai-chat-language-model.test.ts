import { LanguageModelV1Prompt } from '@ai-sdk/provider';
import {
  JsonTestServer,
  StreamingTestServer,
  convertReadableStreamToArray,
} from '@ai-sdk/provider-utils/test';
import { createCFWorkerAI } from './cfworkerai-provider';
import { describe, it, expect } from 'vitest'

const TEST_PROMPT: LanguageModelV1Prompt = [
  { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
];

const provider = createCFWorkerAI( { apiKey: 'test-api-key' } );
const model = provider.chat( 'cfworkerai-small-latest' );

describe( 'doGenerate', () => {
  const server = new JsonTestServer(
    process.env.CF_BASE_URL + '/v1/chat/completions',
  );

  server.setupTestEnvironment();

  function prepareJsonResponse( {
    content = '',
    usage = {
      prompt_tokens: 4,
      total_tokens: 34,
      completion_tokens: 30,
    },
  }: {
    content?: string;
    usage?: {
      prompt_tokens: number;
      total_tokens: number;
      completion_tokens: number;
    };
  } ) {
    server.responseBodyJson = {
      id: '16362f24e60340d0994dd205c267a43a',
      object: 'chat.completion',
      created: 1711113008,
      model: 'cfworkerai-small-latest',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content,
            tool_calls: null,
          },
          finish_reason: 'stop',
          logprobs: null,
        },
      ],
      usage,
    };
  }

  it( 'should extract text response', async () => {
    prepareJsonResponse( { content: 'Hello, World!' } );

    const { text } = await model.doGenerate( {
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: TEST_PROMPT,
    } );

    expect( text ).toStrictEqual( 'Hello, World!' );
  } );

  it( 'should extract usage', async () => {
    prepareJsonResponse( {
      content: '',
      usage: { prompt_tokens: 20, total_tokens: 25, completion_tokens: 5 },
    } );

    const { usage } = await model.doGenerate( {
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: TEST_PROMPT,
    } );

    expect( usage ).toStrictEqual( {
      promptTokens: 20,
      completionTokens: 5,
    } );
  } );

  it( 'should expose the raw response headers', async () => {
    prepareJsonResponse( { content: '' } );

    server.responseHeaders = {
      'test-header': 'test-value',
    };

    const { rawResponse } = await model.doGenerate( {
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: TEST_PROMPT,
    } );

    expect( rawResponse?.headers ).toStrictEqual( {
      // default headers:
      'content-length': '317',
      'content-type': 'application/json',

      // custom header
      'test-header': 'test-value',
    } );
  } );

  it( 'should pass the model and the messages', async () => {
    prepareJsonResponse( { content: '' } );

    await model.doGenerate( {
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: TEST_PROMPT,
    } );

    expect( await server.getRequestBodyJson() ).toStrictEqual( {
      model: 'cfworkerai-small-latest',
      messages: [{ role: 'user', content: 'Hello' }],
    } );
  } );

  it( 'should pass tools and toolChoice', async () => {
    prepareJsonResponse( { content: '' } );

    await model.doGenerate( {
      inputFormat: 'prompt',
      mode: {
        type: 'regular',
        tools: [
          {
            type: 'function',
            name: 'test-tool',
            parameters: {
              type: 'object',
              properties: { value: { type: 'string' } },
              required: ['value'],
              additionalProperties: false,
              $schema: 'http://json-schema.org/draft-07/schema#',
            },
          },
        ],
        toolChoice: {
          type: 'tool',
          toolName: 'test-tool',
        },
      },
      prompt: TEST_PROMPT,
    } );

    expect( await server.getRequestBodyJson() ).toStrictEqual( {
      model: 'cfworkerai-small-latest',
      messages: [{ role: 'user', content: 'Hello' }],
      tools: [
        {
          type: 'function',
          function: {
            name: 'test-tool',
            parameters: {
              type: 'object',
              properties: { value: { type: 'string' } },
              required: ['value'],
              additionalProperties: false,
              $schema: 'http://json-schema.org/draft-07/schema#',
            },
          },
        },
      ],
      tool_choice: 'any',
    } );
  } );

  it( 'should pass headers', async () => {
    prepareJsonResponse( { content: '' } );

    const provider = createCFWorkerAI( {
      apiKey: 'test-api-key',
      headers: {
        'Custom-Provider-Header': 'provider-header-value',
      },
    } );

    await provider.chat( 'cfworkerai-small-latest' ).doGenerate( {
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: TEST_PROMPT,
      headers: {
        'Custom-Request-Header': 'request-header-value',
      },
    } );

    const requestHeaders = await server.getRequestHeaders();

    expect( requestHeaders ).toStrictEqual( {
      authorization: 'Bearer test-api-key',
      'content-type': 'application/json',
      'custom-provider-header': 'provider-header-value',
      'custom-request-header': 'request-header-value',
    } );
  } );
} );

describe( 'doStream', () => {
  const server = new StreamingTestServer(
    'https://gateway.ai.cloudflare.com/v1/9d6ad60ab34678372b0cc7a39a236b03/cgc-gw/workers-ai/v1/chat/completions',
  );

  server.setupTestEnvironment();

  function prepareStreamResponse( { content }: { content: string[] } ) {
    server.responseChunks = [
      `data:  {"id":"6e2cd91750904b7092f49bdca9083de1","object":"chat.completion.chunk",` +
      `"created":1711097175,"model":"cfworkerai-small-latest","choices":[{"index":0,` +
      `"delta":{"role":"assistant","content":""},"finish_reason":null,"logprobs":null}]}\n\n`,
      ...content.map( text => {
        return (
          `data:  {"id":"6e2cd91750904b7092f49bdca9083de1","object":"chat.completion.chunk",` +
          `"created":1711097175,"model":"cfworkerai-small-latest","choices":[{"index":0,` +
          `"delta":{"role":"assistant","content":"${text}"},"finish_reason":null,"logprobs":null}]}\n\n`
        );
      } ),
      `data:  {"id":"6e2cd91750904b7092f49bdca9083de1","object":"chat.completion.chunk",` +
      `"created":1711097175,"model":"cfworkerai-small-latest","choices":[{"index":0,` +
      `"delta":{"content":""},"finish_reason":"stop","logprobs":null}],` +
      `"usage":{"prompt_tokens":4,"total_tokens":36,"completion_tokens":32}}\n\n`,
      `data: [DONE]\n\n`,
    ];
  }

  it( 'should stream text deltas', async () => {
    prepareStreamResponse( { content: ['Hello', ', ', 'world!'] } );

    const { stream } = await model.doStream( {
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: TEST_PROMPT,
    } );

    expect( await convertReadableStreamToArray( stream ) ).toStrictEqual( [
      { type: 'text-delta', textDelta: '' },
      { type: 'text-delta', textDelta: 'Hello' },
      { type: 'text-delta', textDelta: ', ' },
      { type: 'text-delta', textDelta: 'world!' },
      { type: 'text-delta', textDelta: '' },
      {
        type: 'finish',
        finishReason: 'stop',
        usage: { promptTokens: 4, completionTokens: 32 },
      },
    ] );
  } );

  it( 'should stream tool deltas', async () => {
    server.responseChunks = [
      `data: {"id":"ad6f7ce6543c4d0890280ae184fe4dd8","object":"chat.completion.chunk","created":1711365023,"model":"cfworkerai-large-latest",` +
      `"choices":[{"index":0,"delta":{"role":"assistant","content":""},"finish_reason":null,"logprobs":null}]}\n\n`,
      `data: {"id":"ad6f7ce6543c4d0890280ae184fe4dd8","object":"chat.completion.chunk","created":1711365023,"model":"cfworkerai-large-latest",` +
      `"choices":[{"index":0,"delta":{"content":null,"tool_calls":[{"function":{"name":"test-tool","arguments":` +
      `"{\\"value\\":\\"Sparkle Day\\"}"` +
      `}}]},"finish_reason":"tool_calls","logprobs":null}],"usage":{"prompt_tokens":183,"total_tokens":316,"completion_tokens":133}}\n\n`,
      'data: [DONE]\n\n',
    ];

    const { stream } = await createCFWorkerAI( {
      apiKey: 'test-api-key',
      generateId: () => 'test-id',
    } )
      .chat( 'cfworkerai-large-latest' )
      .doStream( {
        inputFormat: 'prompt',
        mode: {
          type: 'regular',
          tools: [
            {
              type: 'function',
              name: 'test-tool',
              parameters: {
                type: 'object',
                properties: { value: { type: 'string' } },
                required: ['value'],
                additionalProperties: false,
                $schema: 'http://json-schema.org/draft-07/schema#',
              },
            },
          ],
        },
        prompt: TEST_PROMPT,
      } );

    expect( await convertReadableStreamToArray( stream ) ).toStrictEqual( [
      {
        type: 'text-delta',
        textDelta: '',
      },
      {
        type: 'tool-call-delta',
        toolCallId: 'test-id',
        toolCallType: 'function',
        toolName: 'test-tool',
        argsTextDelta: '{"value":"Sparkle Day"}',
      },
      {
        type: 'tool-call',
        toolCallId: 'test-id',
        toolCallType: 'function',
        toolName: 'test-tool',
        args: '{"value":"Sparkle Day"}',
      },
      {
        type: 'finish',
        finishReason: 'tool-calls',
        usage: { promptTokens: 183, completionTokens: 133 },
      },
    ] );
  } );

  it( 'should expose the raw response headers', async () => {
    prepareStreamResponse( { content: [] } );

    server.responseHeaders = {
      'test-header': 'test-value',
    };

    const { rawResponse } = await model.doStream( {
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: TEST_PROMPT,
    } );

    expect( rawResponse?.headers ).toStrictEqual( {
      // default headers:
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',

      // custom header
      'test-header': 'test-value',
    } );
  } );

  it( 'should pass the messages', async () => {
    prepareStreamResponse( { content: [''] } );

    await model.doStream( {
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: TEST_PROMPT,
    } );

    expect( await server.getRequestBodyJson() ).toStrictEqual( {
      stream: true,
      model: 'cfworkerai-small-latest',
      messages: [{ role: 'user', content: 'Hello' }],
    } );
  } );

  it( 'should pass headers', async () => {
    prepareStreamResponse( { content: [] } );

    const provider = createCFWorkerAI( {
      apiKey: 'test-api-key',
      headers: {
        'Custom-Provider-Header': 'provider-header-value',
      },
    } );

    await provider.chat( 'cfworkerai-small-latest' ).doStream( {
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: TEST_PROMPT,
      headers: {
        'Custom-Request-Header': 'request-header-value',
      },
    } );

    const requestHeaders = await server.getRequestHeaders();

    expect( requestHeaders ).toStrictEqual( {
      authorization: 'Bearer test-api-key',
      'content-type': 'application/json',
      'custom-provider-header': 'provider-header-value',
      'custom-request-header': 'request-header-value',
    } );
  } );
} );
