import { VideoTranscriptEditor } from "@/components/video-transcript-editor";

export default function Home() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="w-screen min-h-screen">
        <VideoTranscriptEditor />
      </div>
    </div>
  );
}
