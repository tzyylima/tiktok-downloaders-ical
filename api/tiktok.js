export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  const { url, format } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, message: "URL kosong" });
  }

  try {
    // contoh provider downloader
    const api = `https://api.tiklydown.me/api/download?url=${encodeURIComponent(url)}`;
    const response = await fetch(api);
    const data = await response.json();

    let downloadUrl;

    if (format === "mp3") {
      downloadUrl = data.music?.play;
    } else if (format === "hd") {
      downloadUrl = data.video?.hd;
    } else {
      downloadUrl = data.video?.noWatermark;
    }

    if (!downloadUrl) {
      return res.status(500).json({ success: false });
    }

    res.status(200).json({
      success: true,
      title: data.title || "TikTok Video",
      author: data.author?.name || "Unknown",
      download: downloadUrl,
      preview: format === "mp3" ? null : downloadUrl,
      format
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}