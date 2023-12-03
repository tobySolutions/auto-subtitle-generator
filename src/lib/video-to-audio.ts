/**
 * Converts a video file to an audio file.
 *
 * @param {File} videoFileData - The video file to convert.
 * @param {string} targetAudioFormat - The target audio format.
 * @returns {Promise<Blob>} The converted audio file.
 */
export async function videoToAudio(
  videoFileData: File,
  targetAudioFormat: string
): Promise<Blob> {
  targetAudioFormat = targetAudioFormat.toLowerCase();
  const videoFileAsBuffer = await readFileAsArrayBuffer(videoFileData);
  const audioBuffer = await decodeAudioData(videoFileAsBuffer);
  const renderedBuffer = await renderOfflineAudio(audioBuffer);
  const wavData = createWaveFileData(renderedBuffer);
  return createBlobFromWaveData(wavData, `audio/${targetAudioFormat}`);
}

/**
 * Reads a Blob as an ArrayBuffer.
 *
 * @param {Blob} blob - The Blob to read.
 * @returns {Promise<ArrayBuffer>} The Blob's data as an ArrayBuffer.
 */
function readFileAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}
/**
 * Decodes audio data into an AudioBuffer.
 *
 * @param {ArrayBuffer} audioData - The audio data to decode.
 * @returns {Promise<AudioBuffer>} The decoded audio data as an AudioBuffer.
 */
async function decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer> {
  // @ts-ignore - Safari doesn't support AudioContext
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  return audioContext.decodeAudioData(audioData);
}

/**
 * Renders an AudioBuffer offline.
 *
 * @param {AudioBuffer} audioBuffer - The AudioBuffer to render.
 * @returns {Promise<AudioBuffer>} The rendered AudioBuffer.
 */
async function renderOfflineAudio(
  audioBuffer: AudioBuffer
): Promise<AudioBuffer> {
  const sampleRate = 16000;
  const offlineAudioContext = new OfflineAudioContext(
    1,
    sampleRate * audioBuffer.duration,
    sampleRate
  );
  const soundSource = offlineAudioContext.createBufferSource();
  soundSource.buffer = audioBuffer;
  soundSource.connect(offlineAudioContext.destination);
  soundSource.start();
  return offlineAudioContext.startRendering();
}

/**
 * Creates a Blob from wave data.
 *
 * @param {Uint8Array} waveData - The wave data to convert to a Blob.
 * @param {string} contentType - The content type of the Blob.
 * @returns {Blob} The created Blob.
 */
function createBlobFromWaveData(
  waveData: Uint8Array,
  contentType: string
): Blob {
  return new Blob([waveData], { type: contentType });
}

/**
 * Creates wave file data from an AudioBuffer.
 *
 * @param {AudioBuffer} audioBuffer - The AudioBuffer to convert.
 * @returns {Uint8Array} The created wave file data.
 */
function createWaveFileData(audioBuffer: AudioBuffer): Uint8Array {
  const frameLength = audioBuffer.length;
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numberOfChannels * bitsPerSample) / 8;
  const blockAlign = (numberOfChannels * bitsPerSample) / 8;
  const wavDataByteLength = frameLength * numberOfChannels * 2;
  const headerByteLength = 44;
  const totalLength = headerByteLength + wavDataByteLength;

  const waveFileData = new Uint8Array(totalLength);

  const subChunk1Size = 16;
  const subChunk2Size = wavDataByteLength;
  const chunkSize = 4 + (8 + subChunk1Size) + (8 + subChunk2Size);

  writeString("RIFF", waveFileData, 0);
  writeInt32(chunkSize, waveFileData, 4);
  writeString("WAVE", waveFileData, 8);
  writeString("fmt ", waveFileData, 12);

  writeInt32(subChunk1Size, waveFileData, 16);
  writeInt16(1, waveFileData, 20);
  writeInt16(numberOfChannels, waveFileData, 22);
  writeInt32(sampleRate, waveFileData, 24);
  writeInt32(byteRate, waveFileData, 28);
  writeInt16(blockAlign, waveFileData, 32);
  writeInt16(bitsPerSample, waveFileData, 34);

  writeString("data", waveFileData, 36);
  writeInt32(subChunk2Size, waveFileData, 40);

  writeAudioBuffer(audioBuffer, waveFileData, 44);

  return waveFileData;
}

/**
 * Writes a string to a Uint8Array at a specified offset.
 *
 * @param {string} s - The string to write.
 * @param {Uint8Array} a - The Uint8Array to write to.
 * @param {number} offset - The offset at which to start writing.
 */
function writeString(s: string, a: Uint8Array, offset: number): void {
  for (let i = 0; i < s.length; ++i) {
    a[offset + i] = s.charCodeAt(i);
  }
}

/**
 * Writes a 16-bit integer to a Uint8Array at a specified offset.
 *
 * @param {number} n - The integer to write.
 * @param {Uint8Array} a - The Uint8Array to write to.
 * @param {number} offset - The offset at which to start writing.
 */
function writeInt16(n: number, a: Uint8Array, offset: number): void {
  const b1 = n & 255;
  const b2 = (n >> 8) & 255;

  a[offset + 0] = b1;
  a[offset + 1] = b2;
}

/**
 * Writes a 32-bit integer to a Uint8Array at a specified offset.
 *
 * @param {number} n - The integer to write.
 * @param {Uint8Array} a - The Uint8Array to write to.
 * @param {number} offset - The offset at which to start writing.
 */
function writeInt32(n: number, a: Uint8Array, offset: number): void {
  const b1 = n & 255;
  const b2 = (n >> 8) & 255;
  const b3 = (n >> 16) & 255;
  const b4 = (n >> 24) & 255;

  a[offset + 0] = b1;
  a[offset + 1] = b2;
  a[offset + 2] = b3;
  a[offset + 3] = b4;
}

/**
 * Writes an AudioBuffer to a Uint8Array at a specified offset.
 *
 * @param {AudioBuffer} audioBuffer - The AudioBuffer to write.
 * @param {Uint8Array} a - The Uint8Array to write to.
 * @param {number} offset - The offset at which to start writing.
 */
function writeAudioBuffer(
  audioBuffer: AudioBuffer,
  a: Uint8Array,
  offset: number
): void {
  const channels = audioBuffer.numberOfChannels;

  for (let i = 0; i < audioBuffer.length; ++i) {
    for (let k = 0; k < channels; ++k) {
      const buffer = audioBuffer.getChannelData(k);
      let sample = buffer[i] * 32768.0;

      sample = Math.max(-32768, Math.min(sample, 32767));

      writeInt16(sample, a, offset);
      offset += 2;
    }
  }
}
