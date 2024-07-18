import { JsonTestServer } from '@ai-sdk/provider-utils/test';
import { createCFWorkerAI } from './cfworkerai-provider';
import { describe, it, expect } from 'vitest'

const TEST_PROMPT: string = "give feedback";

const provider = createCFWorkerAI( { apiKey: 'test-api-key' } );
const model = provider.rest( 'cfworkerai-small-latest' );

describe( 'doGenerate', () => {
  const server = new JsonTestServer(
    process.env.CF_BASE_URL + '/' + model.modelId,
  );

  const image_feedback = " The image displays a computer screen with a purple background and a variety of icons"

  server.setupTestEnvironment();

  function prepareJsonResponse( {
    text = '',
    prompt = '',
    image = [],
  }: {
    text?: string;
    prompt?: string;
    image?: Blob[];
  } ) {
    server.responseBodyJson = {
      "result": {
        "description": image_feedback
      },
      "success": true,
      "errors": [],
      "messages": []
    };
  }

  it( 'should extract text response', async () => {
    prepareJsonResponse( { prompt: 'give feedback', } );

    const { text } = await model.doGenerate( {
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: TEST_PROMPT,
    } );

    expect( text ).toStrictEqual( image_feedback );
  } );

  it( 'should pass the model and the messages', async () => {
    prepareJsonResponse( { prompt: '' } );

    await model.doGenerate( {
      inputFormat: 'prompt',
      mode: { type: 'regular' },
      prompt: TEST_PROMPT,
    } );
    const requestBody = await server.getRequestBodyJson()
    expect( requestBody ).toStrictEqual( {
      model: 'cfworkerai-small-latest',
      prompt: TEST_PROMPT,
    } );
  } );

  it( 'should pass headers', async () => {
    prepareJsonResponse( { prompt: '' } );

    const provider = createCFWorkerAI( {
      apiKey: 'test-api-key',
      headers: {
        'Custom-Provider-Header': 'provider-header-value',
      },
    } );

    await provider.rest( 'cfworkerai-small-latest' ).doGenerate( {
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

