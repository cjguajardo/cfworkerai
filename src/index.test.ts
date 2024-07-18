import { describe, it, expect } from 'vitest';
import { cfworkerai } from './cfworkerai-provider';
import { generateText, GenerateTextResult, streamText, StreamTextResult } from 'ai';

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

  it( 'Should generate a stream response', async () => {
    const result = await streamText( {
      model: cfworkerai( '@cf/meta/llama-2-7b-chat-fp16' ),
      messages: [
        {
          role: 'user',
          content: 'Write a vegetarian lasagna recipe for 4 people.'
        }
      ]
    } );

    expect( result ).toBeInstanceOf( StreamTextResult )
  } )
} )

describe( 'generateText from image', () => {
  const model = '@cf/llava-hf/llava-1.5-7b-hf'

  it( 'should generate text from image', async () => {

    // reads the image from ./test-assets/cgcapps_cj.jpg
    const image = await fetch( 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__480.jpg' )
      .then( response => response.blob() )

    const response = await generateText( {
      model: cfworkerai( model, { use_rest: true } ),
      messages: [
        {
          role: 'user',
          content: [
            { type: "text", text: 'Describe the image' },
            { type: "image", image: await image.arrayBuffer() }
          ]
        }
      ]
    } )

    console.log( { response } );

    expect( response ).toBeInstanceOf( GenerateTextResult )
  } )
} )