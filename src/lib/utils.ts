import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MessageTypes = {
  DOWNLOADING: "DOWNLOADING",
  LOADING: "LOADING",
  RESULT: "RESULT",
  RESULT_PARTIAL: "RESULT_PARTIAL",
  INFERENCE_REQUEST: "INFERENCE_REQUEST",
  INFERENCE_DONE: "INFERENCE_DONE",
};

const LoadingStatus = {
  SUCCESS: "success",
  ERROR: "error",
  LOADING: "loading",
};

const ModelNames = {
  WHISPER_TINY_EN: "openai/whisper-tiny.en",
  XENOVA_TINY: "Xenova/whisper-tiny",
  WHISPER_TINY: "openai/whisper-tiny",
  WHISPER_BASE: "openai/whisper-base",
  WHISPER_BASE_EN: "openai/whisper-base.en",
  WHISPER_SMALL: "openai/whisper-small",
  WHISPER_SMALL_EN: "openai/whisper-small.en",
};

async function readAudioFrom(file: Blob) {
  const sampling_rate = 16000;
  const audioCTX = new AudioContext({ sampleRate: sampling_rate });
  const response = await file.arrayBuffer();
  const decoded = await audioCTX.decodeAudioData(response);
  const audio = decoded.getChannelData(0);
  return audio;
}

interface Subtitle {
  index: number;
  text: string;
  start: number;
  end: number;
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  const msecs = ((seconds % 1) * 1000).toFixed(0).padStart(3, "0");

  return `${hrs}:${mins}:${secs},${msecs}`;
}

function generateSRT(jsonData: Subtitle[]): string {
  let srtContent = "";

  jsonData.forEach((subtitle) => {
    const startTime = formatTime(subtitle.start);
    const endTime = formatTime(subtitle.end);
    srtContent += `${subtitle.index + 1}\n${startTime} --> ${endTime}\n${
      subtitle.text
    }\n\n`;
  });

  return srtContent;
}

export {
  MessageTypes,
  ModelNames,
  LoadingStatus,
  readAudioFrom,
  generateSRT,
  type Subtitle,
};
