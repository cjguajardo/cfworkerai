import { describe, it, expect } from 'vitest';
import { cfworkerai } from './cfworkerai-provider';
import { generateText, GenerateTextResult, generateObject } from 'ai';

describe( 'generateText', () => {
  const model = '@cf/meta/llama-2-7b-chat-fp16'

  it( 'should generate text', async () => {
    const response = await generateText( {
      model: cfworkerai( model ),
      "messages": [
        {
          "role": "user",
          "content": "Hi"
        }
      ],
    } );

    expect( response ).toBeInstanceOf( GenerateTextResult )
  } );

  it( 'should generate text from prompt', async () => {
    const response = await generateText( {
      model: cfworkerai( model ),
      "prompt": "Hi"
    } );

    expect( response ).toBeInstanceOf( GenerateTextResult )
  } )
} )
