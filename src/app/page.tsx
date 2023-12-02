"use client";

import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const Page: React.FC = () => {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputVideo, setInputVideo] = useState<File | null>(null);
  const ffmpegRef = useRef(new FFmpeg());
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setInputVideo(file || null);
  };

  const load = async () => {
    setIsLoading(true);
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });
    setLoaded(true);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, [inputVideo]);

  const transcode = async () => {
    if (!inputVideo) {
      console.error("No input video selected.");
      return;
    }

    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile("input.mp4", await fetchFile(inputVideo));
    await ffmpeg.exec(["-i", "input.mp4", "output.mp4"]);
    const data = (await ffmpeg.readFile("output.mp4")) as any;
    if (videoRef.current)
      videoRef.current.src = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
  };

  useEffect(() => {
    if (inputVideo) {
      console.log("Selected Video:", inputVideo);
    }
  }, [inputVideo]);

  return (
    <div className="flex flex-col gap-4">
      <div className="">
        <video ref={videoRef} controls></video>
        <br />
        <button
          onClick={transcode}
          className="bg-green-500 hover:bg-green-700 text-white py-3 px-6 rounded"
        >
          Transcode
        </button>
        <p ref={messageRef}></p>
      </div>

      <input type="file" onChange={handleFileUpload} />
    </div>
  );
};

export default function Home() {
  return (
    <div className="flex h-screen w-[100%] items-center justify-center">
      <div>
        <Page />
      </div>
    </div>
  );
}
