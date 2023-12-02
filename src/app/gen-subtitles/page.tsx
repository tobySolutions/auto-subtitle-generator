"use client";
import { Subtitle, readAudioFrom, generateSRT } from "@/lib/utils";
import React, {
  ChangeEvent,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";

const Page: React.FC = () => {
  const workerRef = useRef<Worker>();

  const [results, setResults] = useState<Subtitle[]>([]);
  const [done, setDone] = useState<boolean>(false);

  const handleMessage = (event: MessageEvent) => {
    const { type } = event.data;
    console.log(event.data);
    switch (type) {
      case "INFERENCE_RESPONSE":
        break;
      case "INFERENCE_DONE":
        console.log(results);
        setDone(true);

        break;
      case "RESULT":
        console.log(event.data.results);
        setResults(event.data.results);
        break;
      default:
        break;
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    const audio = await readAudioFrom(file!);

    workerRef.current?.postMessage({
      type: "INFERENCE_REQUEST",
      audio,
      model_name: "Xenova/whisper-tiny",
    });
  };

  useEffect(() => {
    workerRef.current = new Worker(new URL("./transcribe.ts", import.meta.url));
    workerRef.current.onmessage = handleMessage;

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const loadModel = useCallback(async () => {
    workerRef.current?.postMessage({ type: "loadModel" });
  }, []);

  const handleDownloadSRT = useCallback(() => {
    const srt = generateSRT(results);
    console.log(srt);
    // download srt
    const blob = new Blob([srt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subtitle.srt";
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />{" "}
      <button onClick={loadModel}>Load Model</button>
      <button onClick={handleDownloadSRT}>downloadSRT </button>
      {JSON.stringify(generateSRT(results))}
    </div>
  );
};

export default Page;
