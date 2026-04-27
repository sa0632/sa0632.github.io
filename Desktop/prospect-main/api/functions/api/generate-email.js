exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const { name, cat, addr } = JSON.parse(event.body);

  const prompt = `You are Helena Le, a freelance web designer in Newport News, Virginia. Write a short friendly cold outreach email to a local business owner.

Business name: ${name}
Business type: ${cat}
Address: ${addr}

Rules:
- Start with "Hi there,"
- Mention their business name and type naturally
- Say you noticed they don't have a website
- Say you build websites for local small businesses in the Hampton Roads area
- Say you put together a quick concept for them
- List 3 short bullet points: shows up in Google searches, lets customers find hours/location/services, works great on phones
- Mention they can check out helenaledev.com
- Ask if they want to take a look, no commitment needed
- Sign off as Helena Le with helenaledev.com and (904) 882-1248
- Keep it under 200 words
- Do NOT include a subject line
- Sound human and casual, not salesy

Write only the email body, nothing else.`;

  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3", prompt, stream: false })
    });

    const data = await res.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: `Quick idea for ${name}`,
        body: data.response.trim()
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Ollama not running. Open terminal and run: ollama serve" })
    };
  }
};