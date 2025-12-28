export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  const { url, format } = req.body;
  if (!url) {
    return res.status(400).json({
      success: false,
      message: "URL kosong"
    });
  }

  // LIST PROVIDER (URUTAN = PRIORITAS)
  const providers = [
    `https://api.tiklydown.me/api/download?url=${encodeURIComponent(url)}`,
    `https://tikwm.com/api/?url=${encodeURIComponent(url)}`
  ];

  let data = null;

  for (const api of providers) {
    try {
      const r = await fetch(api, { timeout: 15000 });
      const j = await r.json();

      if (j && (j.video || j.data)) {
        data = j;
        break;
      }
    } catch (e) {
      // lanjut ke provider berikutnya
    }
  }

  if (!data) {
    return res.status(500).json({
      success: false,
      message: "Semua provider gagal (TikTok kemungkinan blok)"
    });
  }

  let downloadUrl;

  // NORMALISASI FIELD
  if (format === "mp3") {
    downloadUrl =
      data.music?.play ||
      data.data?.music ||
      data.data?.audio;
  } else {
    downloadUrl =
      data.video?.noWatermark ||
      data.video?.no_wm ||
      data.data?.play ||
      data.data?.wmplay;
  }

  if (!downloadUrl) {
    return res.status(500).json({
      success: false,
      message: "Format tidak tersedia untuk video ini"
    });
  }

  res.status(200).json({
    success: true,
    title: data.title || data.data?.title || "TikTok Video",
    download: downloadUrl,
    format
  });
      }
