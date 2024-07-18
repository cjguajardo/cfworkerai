import {
  LanguageModelV1Prompt,
  UnsupportedFunctionalityError,
} from '@ai-sdk/provider';


export interface CFWorkerAIRESTPrompt {
  prompt?: string;
  text?: string;
  image?: number[];
}


export function convertToCFWorkerAIRESTInput(
  prompt: LanguageModelV1Prompt | string,
): CFWorkerAIRESTPrompt {
  const args: CFWorkerAIRESTPrompt = {};


  if ( typeof prompt === 'string' ) {
    args.prompt = prompt;
  } else {
    for ( const { role, content } of prompt ) {
      switch ( role ) {
        case 'user': {
          const textPart = content.find( part => part.type === 'text' );
          const imagePart = content.find( part => part.type === 'image' );
          args.prompt = textPart?.text;
          if ( imagePart ) {
            const instanceName = imagePart.image.constructor.name ?? '';
            if ( instanceName === 'Uint8Array' ) {
              // const _blob = new Blob( [imagePart.image as Uint8Array], { type: imagePart.mimeType } );
              const numberArray = Array.from( imagePart.image as Uint8Array );
              args.image = numberArray;
            } else {
              throw new UnsupportedFunctionalityError( {
                functionality: 'image-part-' + ( instanceName ),
              } );
            }
          }

          break;
        }

        default: {
          throw new Error( `Unsupported role: ${role}` );
        }
      }
    }
  }

  return args;
}
