const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface FlashCard {
  front: string;
  back: string;
}

export interface GenerateResponse {
  cards: FlashCard[];
}

/**
 * Simple path: topic set, no files attached.
 * Calls POST /api/flashcards/generate with a JSON body.
 */
export async function generateFromTopic(
  topic: string,
  sourcesText?: string | null
): Promise<GenerateResponse> {
  const res = await fetch(`${BASE}/api/flashcards/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, sources_text: sourcesText || null }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { detail?: string }).detail ?? `Server error ${res.status}`
    );
  }

  return res.json() as Promise<GenerateResponse>;
}

/**
 * File path: files attached (and/or only sources text + files).
 * Calls POST /api/flashcards/generate-from-files with multipart FormData.
 */
export async function generateFromFiles(
  topicHint: string,
  sourcesText: string,
  files: FileList | null
): Promise<GenerateResponse> {
  const fd = new FormData();
  fd.append("topic_hint", topicHint);
  fd.append("sources_text", sourcesText);

  if (files) {
    for (let i = 0; i < files.length; i++) {
      fd.append("files", files[i]);
    }
  }

  const res = await fetch(`${BASE}/api/flashcards/generate-from-files`, {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { detail?: string }).detail ?? `Server error ${res.status}`
    );
  }

  return res.json() as Promise<GenerateResponse>;
}
