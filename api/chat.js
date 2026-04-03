export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({ message: "API working" });
    }

    // ✅ SAFE BODY PARSE
    let body = req.body;

    if (!body) {
      body = await new Promise((resolve) => {
        let data = "";
        req.on("data", chunk => data += chunk);
        req.on("end", () => resolve(JSON.parse(data)));
      });
    }

    const message = body.message;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: "You are SSC AI tutor. Explain in Hinglish." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    return res.status(200).json({
      reply: data?.choices?.[0]?.message?.content || "No response"
    });

  } catch (error) {
    console.error("ERROR:", error); // 👈 logs me dikhega
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
