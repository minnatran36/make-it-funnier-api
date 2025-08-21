// api/funny.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, style = "wry", spice = 1, remixSeed = "" } = req.body || {};
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
  }
  if (!text) {
    return res.status(400).json({ error: "text required" });
  }

  const system = "You punch-up sentences into one-liners. Keep it concise.";
  const user = `Original: ${text}\nStyle: ${style}\nSpice: ${spice}\nRemix: ${remixSeed}`;

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      })
    });

    const data = await resp.json();
    const output = data?.choices?.[0]?.message?.content ?? "";
    res.status(200).json({ output });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
