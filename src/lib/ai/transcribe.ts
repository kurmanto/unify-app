// Deepgram voice transcription utilities

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export async function transcribeAudio(
  audioBuffer: ArrayBuffer,
  contentType = "audio/webm"
): Promise<TranscriptionResult> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error("Deepgram API key not configured");
  }

  const response = await fetch(
    "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&paragraphs=true&utterances=true",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": contentType,
      },
      body: audioBuffer,
    }
  );

  if (!response.ok) {
    throw new Error(`Transcription failed: ${response.statusText}`);
  }

  const result = await response.json();
  const alternative = result.results?.channels?.[0]?.alternatives?.[0];

  return {
    transcript: alternative?.transcript || "",
    confidence: alternative?.confidence || 0,
    words: alternative?.words || [],
  };
}
