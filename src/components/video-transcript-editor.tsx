"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { videoToAudio } from "@/lib/video-to-audio";
import { Subtitle, generateSRT, readAudioFrom } from "@/lib/utils";
import { ModelStatus } from "./model-status";

interface VideoTranscriptEditorProps {}

const MODEL_NAME = "Xenova/whisper-tiny";

export function VideoTranscriptEditor(props: VideoTranscriptEditorProps) {
  const workerRef = useRef<Worker>();

  const [results, setResults] = useState<Subtitle[]>([]);
  const [done, setDone] = useState<boolean>(false);
  const [processedUntil, setProcessedUntil] = useState<number>(0);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  useState(false);

  const handleUploadLoading = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      setVideoFile(file);
      const audioBlob = await videoToAudio(file!, "mp3");
      const audio = await readAudioFrom(audioBlob);

      workerRef.current?.postMessage({
        type: "INFERENCE_REQUEST",
        audio,
        model_name: MODEL_NAME,
      });
    }

    setUploadLoading(true);
  };

  const handleMessage = (event: MessageEvent) => {
    const { type } = event.data;
    console.log(event.data);
    console.log(event.data.status);
    switch (type) {
      case "LOADING":
        if (event.data.status === "success") {
          setCurrentStep(1);
        }
      case "INFERENCE_RESPONSE":
        break;
      case "INFERENCE_DONE":
        console.log(results);
        setCurrentStep(4);
        setDone(true);

        break;
      case "RESULT":
        setCurrentStep(2);
        console.log(event.data.results);
        setProcessedUntil(event.data.completedUntilTimestamp);
        setResults(event.data.results);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../app/transcribe.ts", import.meta.url)
    );
    workerRef.current.onmessage = handleMessage;

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleDownloadSRT = useCallback(() => {
    const srt = generateSRT(results);
    // download srt
    const blob = new Blob([srt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${videoFile?.name.split(".").slice(0, -1).join(".")}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl p-2 md:p-8 space-y-2 md:space-y-6 bg-white shadow-2xl rounded-2xl dark:bg-gray-800">
        <h2 className="text-2xl md:text-4xl font-extrabold text-center text-gray-800 dark:text-gray-50">
          Generate an SRT file from a video (transcript)
        </h2>
        <div className="flex justify-center">
          <input
            type="file"
            accept="video/*"
            onChange={handleUploadLoading}
            disabled={uploadLoading}
          />
        </div>

        <div className="w-full h-72 bg-gray-100 dark:bg-gray-700 rounded-md overflow-scroll">
          <ModelStatus
            modelName={MODEL_NAME}
            started={uploadLoading}
            // @ts-ignore
            currentStep={currentStep}
            processedUntil={processedUntil}
            videoFile={videoFile}
          />
        </div>
        <div className="w-full h-72 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden">
          {videoFile && (
            <video
              controls
              className="object-cover w-full h-full"
              style={{
                aspectRatio: "16/9",
                objectFit: "cover",
              }}
            >
              <source
                src={URL.createObjectURL(videoFile)}
                type={videoFile.type}
              />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        <div className="space-y-2 md:space-y-6">
          <div className="flex flex-col md:flex-row space-y-2 md:space-x-4 md:space-y-0">
            <Button
              onClick={handleDownloadSRT}
              disabled={!done}
              className="w-full px-3 md:px-6 py-2 md:py-3 text-sm md:text-lg font-semibold bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors duration-300 ease-in-out disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Download Transcript
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
