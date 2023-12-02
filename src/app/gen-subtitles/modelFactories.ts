import { pipeline } from "@xenova/transformers";

// Define a type for the options object that load_model accepts
interface LoadModelOptions {
  progress_callback?: () => void;
}

type ModelLoader = (options: LoadModelOptions) => Promise<any>;

function createModelLoader(model_name: string): ModelLoader {
  let model: any = null;
  const load_model: ModelLoader = async ({ progress_callback = undefined }) => {
    if (model === null) {
      model = await pipeline("automatic-speech-recognition", model_name, {
        progress_callback,
      });
    }
    return model;
  };
  return load_model;
}

export { createModelLoader };
