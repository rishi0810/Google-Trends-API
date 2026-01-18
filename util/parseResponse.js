export function parseResponse(rawResponse, referenceTime = Date.now()) {
  try {
  
    // Remove lines till [[ is found
    const lines = rawResponse.split("\n");
    let jsonLine = null;

    for (const line of lines) {
      const trimmed = line.trim();
      // Look for lines starting with [[ which is the actual data
      if (trimmed.startsWith("[[")) {
        jsonLine = trimmed;
        break;
      }
    }

    if (!jsonLine) {
      console.error("Could not find JSON data line in response");
      return [];
    }
    const parsed = JSON.parse(jsonLine);

    // The structure is generic with [["wrb.fr","i0OFE","[nested JSON string]"...]]
    const trendsDataString = parsed[0][2];
    const trendsData = JSON.parse(trendsDataString);

    // The actual trends are in trendsData[1] as an array
    const trends = trendsData[1];

    if (!trends || !Array.isArray(trends)) {
      return [];
    }

    const result = trends.map((trend) => {
      const term = trend[0] || "";
      const volume = trend[6] || 0;
      const velocity = trend[8] || 0;

      // Formatted score as "500k+, 1000%"
      const score = `${formatVolume(volume)}, ${velocity}%`;

      const timestamp = trend[3] && trend[3][0] ? trend[3][0] * 1000 : null;
      const time = timestamp
        ? formatTimeAgo(timestamp, referenceTime)
        : "Unknown";
      const breakdown = trend[9] || [];

      return {
        term,
        score,
        time,
        breakdown,
      };
    });

    return result;
  } catch (error) {
    console.error("Error parsing Google Trends response:", error.message);
    return [];
  }
}

function formatVolume(volume) {
  if (volume >= 1000000) {
    return `${Math.floor(volume / 1000000)}M+`;
  } else if (volume >= 1000) {
    return `${Math.floor(volume / 1000)}k+`;
  }
  return `${volume}+`;
}

function formatTimeAgo(timestamp, referenceTime) {
  const diffMs = referenceTime - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  } else if (diffHours > 0) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  } else if (diffMinutes > 0) {
    return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
  } else {
    return "Just now";
  }
}

export default parseResponse;
