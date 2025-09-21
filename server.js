// Node.js Express backend (server.js)
const express = require("express");
const cors = require("cors");
const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");
const { fromSSO } = require("@aws-sdk/credential-providers");
const app = express();
app.use(cors());
app.use(express.json());

const client = new BedrockRuntimeClient({
  region: "us-east-1",
  credentials: fromSSO({ profile: "awsisb_IsbUsersPS-569034624657" }),
});

app.post("/api/ai", async (req, res) => {
  try {
    const { message } = req.body;
    const command = new InvokeModelCommand({
    modelId: "arn:aws:bedrock:us-east-1:569034624657:inference-profile/us.amazon.nova-premier-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        messages: [
          { role: "user", content: [{ text: message }] } // message from client
        ],
      }),
    });
      const response = await client.send(command);

      // Convert Uint8Array to string
      const responseBody = Buffer.from(response.body).toString("utf-8");

      // Parse JSON
      const json = JSON.parse(responseBody);

      // Extract the assistant's reply
      // Navigate to the assistant's message text
      let assistantReply = "";
      try {
        assistantReply = json.output.message.content[0].text;
      } catch (err) {
        assistantReply = "Error parsing AI response";
      }
      res.json({ output: assistantReply });
  } catch (err) {
    res.status(500).json({ error: "AI error", details: err.message });
  }
});

app.listen(3000, () => console.log("Backend running on http://localhost:3000"));
