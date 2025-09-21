class MentalHealthBot {
  constructor() {
    this.currentMood = null;
    this.isRecording = false;
    this.recognition = null;
    this.chatMessages = document.getElementById("chatMessages");
    this.messageInput = document.getElementById("messageInput");
    this.sendBtn = document.getElementById("sendBtn");
    this.voiceBtn = document.getElementById("voiceBtn");
    this.typingIndicator = document.getElementById("typingIndicator");
    this.moodDisplay = document.getElementById("moodDisplay");
    this.connectionStatus = document.getElementById("connectionStatus");
    this.useAWS = false;

    this.conversationHistory = [];
    this.sessionId = this.generateSessionId();

    this.initializeEventListeners();
    this.initializeSpeechRecognition();
    this.initializeAWSServices();

    // Welcome message
    setTimeout(() => {
      this.addBotMessage(
        "Hello! I'm MindSpace, your AI mental health companion. I'm here to listen, support, and help you navigate your emotions. How are you feeling today? 😊"
      );
    }, 1000);
  }

  generateSessionId() {
    return (
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
    );
  }

  initializeEventListeners() {
    document.querySelectorAll(".mood-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.selectMood(e.target.closest(".mood-btn"))
      );
    });

    this.messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.messageInput.addEventListener("input", this.autoResize);
    this.sendBtn.addEventListener("click", () => this.sendMessage());
    this.voiceBtn.addEventListener("click", () => this.toggleVoiceRecording());

    this.messageInput.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = Math.min(this.scrollHeight, 120) + "px";
    });
  }

  initializeSpeechRecognition() {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = "en-US";

      this.recognition.onstart = () => {
        this.voiceBtn.classList.add("recording");
        this.connectionStatus.textContent = "Listening...";
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.messageInput.value = transcript;
        this.messageInput.style.height = "auto";
        this.messageInput.style.height =
          Math.min(this.messageInput.scrollHeight, 120) + "px";
        setTimeout(() => {
          if (this.messageInput.value.trim()) {
            this.sendMessage();
          }
        }, 500);
      };

      this.recognition.onend = () => {
        this.voiceBtn.classList.remove("recording");
        this.isRecording = false;
        this.updateConnectionStatus();
      };

      this.recognition.onerror = (event) => {
        this.voiceBtn.classList.remove("recording");
        this.isRecording = false;
        this.connectionStatus.textContent = "Voice recognition error";
        setTimeout(() => this.updateConnectionStatus(), 3000);
      };
    } else {
      this.voiceBtn.style.display = "none";
    }
  }

  initializeAWSServices() {
    if (
      typeof AWS_CONFIG !== "undefined" &&
      AWS_CONFIG.accessKeyId !== "YOUR_ACCESS_KEY_ID"
    ) {
      try {
        this.useAWS = true;
        this.setConnectionStatus("connected", "Connected to Nova Premier");
        console.log("✅ AWS Bedrock Nova Premier initialized");
      } catch (error) {
        console.error("AWS init failed:", error);
        this.useAWS = false;
        this.setConnectionStatus("disconnected", "AWS init failed (Mock Mode)");
      }
    } else {
      this.useAWS = false;
      this.setConnectionStatus("demo", "Demo Mode - Using mock responses");
    }
  }

  updateConnectionStatus() {
    if (this.useAWS) {
      this.setConnectionStatus("connected", "Connected to Nova Premier");
    } else {
      this.setConnectionStatus("demo", "Demo Mode - Using mock responses");
    }
  }

  setConnectionStatus(statusClass, text) {
    const el = this.connectionStatus;
    if (!el) return;

    // Reset classes
    el.innerHTML = "";
    const indicator = document.createElement("span");
    indicator.classList.add("status-indicator");
    indicator.classList.add(statusClass);

    el.appendChild(indicator);
    el.append(" " + text);
  }

  selectMood(moodBtn) {
    document
      .querySelectorAll(".mood-btn")
      .forEach((btn) => btn.classList.remove("selected"));
    moodBtn.classList.add("selected");

    const mood = moodBtn.dataset.mood;
    const moodEmoji = moodBtn.querySelector(".mood-emoji").textContent;
    this.currentMood = mood;

    this.moodDisplay.innerHTML = `<span style="margin-right: 8px;">${moodEmoji}</span>Current mood: ${
      mood.charAt(0).toUpperCase() + mood.slice(1)
    }`;
    this.moodDisplay.classList.add("show");

    this.addUserMessage(`I'm feeling ${mood} today. ${moodEmoji}`);
    setTimeout(() => {
      this.addBotMessage(this.getMoodResponse(mood));
    }, 800);
  }

  getMoodResponse(mood) {
    const responses = {
      happy: "That's wonderful! 😊 What's been bringing you joy lately?",
      sad: "I'm glad you shared this. 💙 Do you want to talk about what's been weighing on you?",
      anxious:
        "I understand anxiety can be overwhelming. 🌸 Would you like a grounding exercise?",
      angry:
        "Thank you for sharing your anger. 🔥 What's been frustrating you?",
      neutral: "That's perfectly okay! 😌 How has your day been so far?",
      excited: "Amazing! ✨ What's got you feeling so energized?",
    };
    return responses[mood] || "Thanks for sharing how you're feeling 💭";
  }

  autoResize() {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 120) + "px";
  }

  toggleVoiceRecording() {
    if (!this.recognition) {
      this.showNotification("Speech recognition not supported.", "warning");
      return;
    }
    if (this.isRecording) {
      this.recognition.stop();
    } else {
      try {
        this.recognition.start();
        this.isRecording = true;
      } catch (error) {
        this.showNotification("Microphone error.", "error");
      }
    }
  }

  sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message) return;
    this.sendBtn.disabled = true;

    this.addUserMessage(message);
    this.messageInput.value = "";
    this.messageInput.style.height = "auto";

    this.conversationHistory.push({
      role: "user",
      content: message,
      mood: this.currentMood,
    });
    this.showTypingIndicator();

    setTimeout(() => {
      this.hideTypingIndicator();
      if (this.useAWS) {
        this.getAWSResponse(message);
      } else {
        this.generateMockResponse(message);
      }
      this.sendBtn.disabled = false;
    }, 1200 + Math.random() * 800);
  }

  addUserMessage(content) {
    this.addMessage("user", content, "👤");
  }
  addBotMessage(content) {
    this.addMessage("bot", content, "🤖");
  }

  addMessage(sender, content, avatar) {
    const div = document.createElement("div");
    div.className = `message ${sender}`;
    div.innerHTML =
      sender === "user"
        ? `<div class="message-content">${content}</div><div class="message-avatar user-avatar">${avatar}</div>`
        : `<div class="message-avatar bot-avatar">${avatar}</div><div class="message-content">${content}</div>`;
    this.chatMessages.appendChild(div);
    this.scrollToBottom();
    if (sender === "bot")
      this.conversationHistory.push({ role: "assistant", content });
  }

  generateMockResponse(msg) {
    const response = MockResponses.generateResponse(
      msg.toLowerCase(),
      this.currentMood,
      this.conversationHistory
    );
    this.addBotMessage(response);
  }

  // 🔥 REAL AWS CALL HERE
  async getAWSResponse(userMessage) {
    // try {
    //   const client = new window.BedrockRuntimeClient({
    //     region: AWS_CONFIG.region,
    //     credentials: {
    //       accessKeyId: AWS_CONFIG.credentials.accessKeyId,
    //       secretAccessKey: AWS_CONFIG.credentials.secretAccessKey,
    //       sessionToken: AWS_CONFIG.credentials.sessionToken || undefined,
    //     },
    //   });

    //   const test = AWS_CONFIG.region;

    //   const command = new window.InvokeModelCommand({
    //     modelId: "amazon.nova-pro-v1", // Nova Premier model ID
    //     contentType: "application/json",
    //     accept: "application/json",
    //     body: JSON.stringify({
    //       inputText: userMessage,
    //       textGenerationConfig: {
    //         maxTokenCount: 500,
    //         temperature: 0.7,
    //         topP: 0.9,
    //       },
    //     }),
    //   });

    //   const response = await client.send(command);
    //   const json = JSON.parse(new TextDecoder().decode(response.body));

    //   let aiText = json.outputText || "Sorry, no response generated.";
    //   this.addBotMessage(aiText);
    // } catch (error) {
    //   console.error("AWS Bedrock error:", error);
    //   this.addBotMessage("⚠️ AWS error. Using mock response instead.");
    //   this.generateMockResponse(userMessage);
    // }
    try {
      const res = await fetch("http://localhost:3000/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      this.addBotMessage(data.output || "Sorry, no response generated.");
    } catch (error) {
      this.addBotMessage("⚠️ AWS error. Using mock response instead.");
      this.generateMockResponse(userMessage);
    }
  }

  showTypingIndicator() {
    this.typingIndicator.style.display = "flex";
    this.scrollToBottom();
  }
  hideTypingIndicator() {
    this.typingIndicator.style.display = "none";
  }
  scrollToBottom() {
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }, 100);
  }

  showNotification(message, type = "info") {
    const n = document.createElement("div");
    n.className = `notification ${type}`;
    n.textContent = message;
    n.style.cssText = `position:fixed;top:20px;right:20px;background:${
      type === "error" ? "#ef4444" : type === "warning" ? "#f59e0b" : "#6366f1"
    };color:#fff;padding:12px 20px;border-radius:8px;z-index:1000;`;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 4000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.mentalHealthBot = new MentalHealthBot();
  console.log("🧘 MindSpace Bot ready!");
});
