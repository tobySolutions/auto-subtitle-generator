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
import { ChangeEvent, useEffect, useState } from "react";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    console.log("Hello!");
    const selectedFile = event.target.files?.[0];

    console.log(event.target);

    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Upload Video</CardTitle>
        <CardDescription>Select a video file from your device.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="video">Video File</Label>
          <input
            accept="video/*"
            // value={file?.name}
            onChange={handleFileInput}
            id="video"
            type="file"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" type="submit">
          Upload
        </Button>
      </CardFooter>
    </Card>
  );
}
