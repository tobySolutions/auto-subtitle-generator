import { MessageTypes, ModelNames } from "@/lib/utils";
import { createModelLoader } from "../lib/modelFactories";

interface ModelLoaders {
  [key: string]: ReturnType<typeof createModelLoader>;
}

const modelLoaders: ModelLoaders = {};

// Populate model loaders
Object.values(ModelNames).forEach((modelName) => {
  modelLoaders[modelName] = createModelLoader(modelName);
});

self.addEventListener("message", async (event: MessageEvent) => {
  const {
    type,
    audio,
    model_name,
  }: { type: string; audio: Blob; model_name: string } = event.data;
  if (type === MessageTypes.INFERENCE_REQUEST) {
    await transcribe(audio, model_name);
  }
});

async function transcribe(audio: Blob, modelName: string): Promise<void> {
  try {
    sendLoadingMessage("loading", "");

    if (!modelLoaders[modelName]) {
      console.log("Model not found");
      sendLoadingMessage("error", "Model not found");
      return;
    }

    const pipeline = await modelLoaders[modelName]({
      // @ts-ignore
      callback_function: loadModelCallback,
    });
    sendLoadingMessage("success");

    const strideLengthSeconds = 5;
    const generationTracker = new GenerationTracker(
      pipeline,
      strideLengthSeconds
    );
    await pipeline(audio, {
      // Configurations (TODO: make these configurable via request)
      top_k: 0,
      do_sample: false,
      chunk_length_s: 30,
      stride_length_s: strideLengthSeconds,
      return_timestamps: true,
      callback_function:
        generationTracker.callbackFunction.bind(generationTracker),
      chunk_callback: generationTracker.chunkCallback.bind(generationTracker),
    });
    generationTracker.sendFinalResult();
  } catch (error) {
    console.error(error);
    sendLoadingMessage("error", String(error));
    return;
  }
}

async function loadModelCallback(data: any): Promise<void> {
  const { status } = data;
  if (status === "progress") {
    const { file, progress, loaded, total } = data;
    sendDownloadingMessage(file, progress, loaded, total);
  }
  // Additional cases for 'done' and 'loaded' can be implemented if needed
}

function sendLoadingMessage(status: string, message?: string): void {
  self.postMessage({
    type: MessageTypes.LOADING,
    status,
    message,
  });
}

function sendDownloadingMessage(
  file: string,
  progress: number,
  loaded: number,
  total: number
): void {
  self.postMessage({
    type: MessageTypes.DOWNLOADING,
    file,
    progress,
    loaded,
    total,
  });
}

class GenerationTracker {
  private pipeline: any; // Specify the type of pipeline if available
  private strideLengthSeconds: number;
  private chunks: any[]; // Specify the type of chunks if available
  private timePrecision: number;
  private processedChunks: any[]; // Specify the type of processedChunks if available
  private callbackFunctionCounter: number;

  constructor(pipeline: any, strideLengthSeconds: number) {
    this.pipeline = pipeline;
    this.strideLengthSeconds = strideLengthSeconds;
    this.chunks = [];
    this.timePrecision =
      pipeline.processor.feature_extractor.config.chunk_length /
      pipeline.model.config.max_source_positions;
    this.processedChunks = [];
    this.callbackFunctionCounter = 0;
  }

  sendFinalResult(): void {
    self.postMessage({ type: MessageTypes.INFERENCE_DONE });
  }

  callbackFunction(beams: any[]): void {
    this.callbackFunctionCounter += 1;
    if (this.callbackFunctionCounter % 10 !== 0) {
      return;
    }

    const bestBeam = beams[0];
    let text = this.pipeline.tokenizer.decode(bestBeam.output_token_ids, {
      skip_special_tokens: true,
    });

    const result = {
      text,
      start: this.getLastChuckTimestamp(),
      end: undefined,
    };
    createPartialResultMessage(result);
  }

  chunkCallback(data: any): void {
    this.chunks.push(data);
    const [text, { chunks }] = this.pipeline.tokenizer._decode_asr(
      this.chunks,
      {
        time_precision: this.timePrecision,
        return_timestamps: true,
        force_full_sequences: false,
      }
    );
    this.processedChunks = chunks.map((chunk: any, index: number) =>
      this.processChunk(chunk, index)
    );
    createResultMessage(
      this.processedChunks,
      false,
      this.getLastChuckTimestamp()
    );
  }

  getLastChuckTimestamp(): number {
    if (this.processedChunks.length === 0) {
      return 0;
    }
    return this.processedChunks[this.processedChunks.length - 1].end;
  }

  private processChunk(chunk: any, index: number): any {
    // Specify the return type if available
    const { text, timestamp } = chunk;
    const [start, end] = timestamp;

    return {
      index,
      text: `${text.trim()} `,
      start: Math.round(start),
      end:
        Math.round(end) || Math.round(start + 0.9 * this.strideLengthSeconds),
    };
  }
}

function createResultMessage(
  results: any[],
  isDone: boolean,
  completedUntilTimestamp: number
): void {
  // Specify the type of results if available
  self.postMessage({
    type: MessageTypes.RESULT,
    results,
    isDone,
    completedUntilTimestamp,
  });
}

function createPartialResultMessage(result: any): void {
  // Specify the type of result if available
  self.postMessage({
    type: MessageTypes.RESULT_PARTIAL,
    result,
  });
}
