import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface VideoTranscriptEditorProps {}

export function VideoTranscriptEditor(props: VideoTranscriptEditorProps) {
  const [uploadLoading, setUploadLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [addTimestampLoading, setAddTimestampLoading] = useState(false);
  const [downloadTranscriptLoading, setDownloadTranscriptLoading] =
    useState(false);

  const handleUploadLoading = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setVideoFile(file);
    }

    setUploadLoading(true);

    // Simulate loading for 2 seconds (replace with your actual loading logic)
    setTimeout(() => {
      setUploadLoading(false);
    }, 2000);
  };

  const handleAddTimestampLoading = () => {
    setAddTimestampLoading(true);

    // Simulate loading for 2 seconds (replace with your actual loading logic)
    setTimeout(() => {
      setAddTimestampLoading(false);
    }, 2000);
  };

  const handleDownloadTranscriptLoading = () => {
    setDownloadTranscriptLoading(true);

    // Simulate loading for 2 seconds (replace with your actual loading logic)
    setTimeout(() => {
      setDownloadTranscriptLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl p-2 md:p-8 space-y-2 md:space-y-6 bg-white shadow-2xl rounded-2xl dark:bg-gray-800">
        <h2 className="text-2xl md:text-4xl font-extrabold text-center text-gray-800 dark:text-gray-50">
          Video Transcript Editor
        </h2>
        <div className="flex justify-center">
          <input
            type="file"
            accept="video/*"
            onChange={handleUploadLoading}
            disabled={uploadLoading || addTimestampLoading || downloadTranscriptLoading}
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
              <source src={URL.createObjectURL(videoFile)} type={videoFile.type} />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
        <div className="space-y-2 md:space-y-6">
          <h3 className="text-xl md:text-2xl font-bold dark:text-gray-50">
            Transcript
          </h3>
          <div className="space-y-2 md:space-y-4">
            <div className="flex flex-col md:flex-row space-y-2 md:space-x-4 md:space-y-0">
              <input
                className="w-full md:w-1/3 px-2 md:px-4 py-2 md:py-3 text-sm md:text-base text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-inner dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                disabled
                placeholder="Timestamp"
                type="text"
              />
              <textarea
                className="w-full md:w-2/3 px-2 md:px-4 py-2 md:py-3 text-sm md:text-base text-gray-700 bg-gray-100 border border-gray-300 rounded-md shadow-inner dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                disabled
                placeholder="Editable Text"
              />
            </div>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-x-4 md:space-y-0">
            <Button
              onClick={handleAddTimestampLoading}
              className="w-full px-3 md:px-6 py-2 md:py-3 text-sm md:text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors duration-300 ease-in-out disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={addTimestampLoading}
            >
              {addTimestampLoading ? 'Adding Timestamp...' : 'Add Timestamp'}
            </Button>
            <Button
              onClick={handleDownloadTranscriptLoading}
              className="w-full px-3 md:px-6 py-2 md:py-3 text-sm md:text-lg font-semibold bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors duration-300 ease-in-out disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={downloadTranscriptLoading}
            >
              {downloadTranscriptLoading ? 'Downloading Transcript...' : 'Download Transcript'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
