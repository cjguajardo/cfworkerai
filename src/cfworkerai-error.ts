import { createJsonErrorResponseHandler } from '@ai-sdk/provider-utils';
import { z } from 'zod';

const cfworkeraiErrorDataSchema = z.object( {
  object: z.literal( 'error' ),
  message: z.string(),
  type: z.string(),
  param: z.string().nullable(),
  code: z.string().nullable(),
} );

export type CFWorkerAIErrorData = z.infer<typeof cfworkeraiErrorDataSchema>;

export const cfworkeraiFailedResponseHandler = createJsonErrorResponseHandler( {
  errorSchema: cfworkeraiErrorDataSchema,
  errorToMessage: data => data.message,
} );
