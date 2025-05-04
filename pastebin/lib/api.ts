const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://pastebin-alb-1223430401.ap-east-1.elb.amazonaws.com:3000";
const ANALYTICS_API_BASE_URL = process.env.NEXT_PUBLIC_ANALYTICS_API_BASE_URL || "http://pastebin-alb-1223430401.ap-east-1.elb.amazonaws.com:3002";

interface Paste {
  id: number;
  slug: string;
  content: string;
  createdAt: string;
  expirationTime: string | null;
}

interface PasteAnalytics {
  id: number;
  dateBucket: string;
  views: number;
  slug: string;
  pasteId: number;
}

export async function createPaste(content: string, expirationType: string): Promise<Paste> {
  const response = await fetch(`${API_BASE_URL}/api/pastes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      expirationType,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create paste");
  }

  return response.json();
}

export async function getPaste(slug: string): Promise<Paste> {
  const response = await fetch(`${API_BASE_URL}/api/pastes/${slug}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch paste");
  }

  return response.json();
}

export async function getPasteAnalytics(
  slug: string,
  startDate = "2024-04-01",
  endDate = "2025-10-30",
  timeoutSeconds = 30, // Increased timeout for slow API
): Promise<PasteAnalytics[]> {
  try {
    const apiUrl = `${ANALYTICS_API_BASE_URL}/api/v1/analytics/paste/${slug}/timeline?startDate=${startDate}&endDate=${endDate}`;

    console.log(`Fetching analytics from: ${apiUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutSeconds * 1000);

    const response = await fetch(apiUrl, {
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API returned error status ${response.status}: ${errorText}`);
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error("Analytics request timed out");
      throw new Error("Request timed out. The analytics server is taking too long to respond.");
    }

    console.error("Error fetching analytics:", error);
    throw error;
  }
}