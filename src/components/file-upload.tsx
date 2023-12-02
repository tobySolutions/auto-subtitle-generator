/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/QD4u6CZSWES
 */
import { CardTitle, CardDescription, CardHeader, CardContent, CardFooter, Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function FileUpload() {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Upload Video</CardTitle>
        <CardDescription>Select a video file from your device.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="video">Video File</Label>
          <Input accept="video/*" id="video" type="file" />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" type="submit">
          Upload
        </Button>
      </CardFooter>
    </Card>
  )
}