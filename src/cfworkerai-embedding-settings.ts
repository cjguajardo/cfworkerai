export type CFWorkerAIEmbeddingModelId = 'cfworkerai-embed' | ( string & {} );

export interface CFWorkerAIEmbeddingSettings {
  /**
Override the maximum number of embeddings per call.
   */
  maxEmbeddingsPerCall?: number;

  /**
Override the parallelism of embedding calls.
    */
  supportsParallelCalls?: boolean;
}
