class MockResponses {
    static generateResponse(message, currentMood, conversationHistory = []) {
        // Crisis detection first
        if (this.detectCrisis(message)) {
            return this.getCrisisResponse();
        }

        // Context-aware responses based on conversation history
        const context = this.analyzeContext(conversationHistory);
        
        // Mood-influenced responses
        if (currentMood) {
            const moodResponse = this.getMoodInfluencedResponse(message, currentMood);
            if (moodResponse) return moodResponse;
        }

        // Pattern matching for specific topics
        const patterns = [
            // Greetings and basic interactions
            {
                patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
                responses: [
                    "Hello! I'm so glad you're here. How are you feeling today? 😊",
                    "Hi there! It's wonderful to connect with you. What's on your mind?",
                    "Hey! I'm here and ready to listen. How can I support you today?",
                    "Good to see you! I'm here to provide a safe space for you to share. How are you doing?"
                ]
            },

            // Stress and overwhelm
            {
                patterns: ['stress', 'stressed', 'overwhelm', 'overwhelming', 'too much', 'pressure', 'burden'],
                responses: [
                    "I hear that you're feeling overwhelmed. That's a really heavy feeling, and it's completely understandable. Let's break this down together - what feels most pressing right now? 🌸",
                    "Stress can feel so consuming. You're not alone in this. Sometimes when everything feels like 'too much,' it helps to focus on just one small thing at a time. What's one thing that might bring you a moment of calm?",
                    "It sounds like you're carrying a lot right now. That takes real strength, even when it doesn't feel like it. Have you been able to take any breaks for yourself lately? Even small ones can help. 💙",
                    "When we're overwhelmed, our nervous system goes into overdrive. Let's try to bring it back down together. Can you take three deep breaths with me? Inhale for 4... hold for 4... exhale for 6... 🌊"
                ]
            },

            // Anxiety and worry
            {
                patterns: ['anxious', 'anxiety', 'worry', 'worried', 'panic', 'nervous', 'fear', 'scared'],
                responses: [
                    "Anxiety can feel so intense and real. I want you to know that what you're experiencing is valid, and you're not alone. Right now, let's ground ourselves in this moment - can you name 5 things you can see around you? 🌱",
                    "I understand that worry can feel like it's taking over your thoughts. It's your mind trying to protect you, but sometimes it goes into overdrive. What would it feel like to give yourself permission to feel anxious without fighting it? 🦋",
                    "Fear has a way of making everything seem bigger and scarier than it might actually be. You've gotten through difficult times before - you have that strength within you. What has helped you cope with anxiety in the past?",
                    "Panic can feel overwhelming, but remember: this feeling will pass. You are safe right now. Let's focus on your breathing - breathe in slowly through your nose, and out through your mouth. I'm here with you. 🌸"
                ]
            },

            // Depression and sadness
            {
                patterns: ['sad', 'sadness', 'depressed', 'depression', 'down', 'low', 'empty', 'hopeless', 'numb'],
                responses: [
                    "I'm really grateful that you shared this with me. Depression can make everything feel so heavy and colorless. Please know that what you're feeling is real, and it's not your fault. Have you been able to take care of your basic needs today - eating, drinking water, getting some rest? 💙",
                    "Sadness can feel like it goes on forever, but feelings do change, even when it's hard to believe. You matter, and your life has value, even when depression tells you otherwise. What's one small thing that used to bring you even a tiny bit of joy?",
                    "That emptiness you're describing sounds so painful. When we're depressed, it's like we're seeing the world through gray-colored glasses. You're incredibly brave for reaching out and talking about this. What does support look like for you right now?",
                    "I hear how much you're struggling right now. Depression can make us feel so isolated, but you're not alone in this. Sometimes just making it through each day is an achievement. Have you been able to connect with any friends, family, or professionals who can support you? 🌻"
                ]
            },

            // Sleep issues
            {
                patterns: ['sleep', 'insomnia', 'tired', 'exhausted', 'can\'t sleep', 'nightmares', 'restless'],
                responses: [
                    "Sleep troubles can affect everything - your mood, energy, and ability to cope. It's so important that you're paying attention to this. What does your bedtime routine look like? Sometimes small changes can make a big difference. 🌙",
                    "Exhaustion makes everything harder, doesn't it? Your body and mind need that rest to recharge. Have you noticed any patterns with your sleep - like thoughts that keep you awake, or things that might be disrupting your rest?",
                    "Sleep and mental health are so connected. When we don't sleep well, our emotional regulation gets harder. What time do you usually try to go to bed? And what's your environment like - is it cool, dark, and quiet? 🛏️",
                    "Nightmares can be so distressing and make us afraid to even try to sleep. That's a form of trauma response sometimes. Are these nightmares related to something specific, or do they seem random? Either way, you deserve peaceful rest."
                ]
            },

            // Relationships and social issues
            {
                patterns: ['relationship', 'partner', 'friend', 'family', 'lonely', 'alone', 'conflict', 'argument', 'breakup'],
                responses: [
                    "Relationships can be one of the most challenging and rewarding parts of life. It sounds like you're navigating something difficult. What's been weighing on your heart about this relationship? 💕",
                    "Loneliness can feel so deep and painful. Even when we're around people, we can still feel alone. That disconnect is real, and it hurts. What does connection mean to you? What would it look like to feel truly seen and understood?",
                    "Conflicts in relationships can be so draining, especially with people we care about. It sounds like you're trying to work through something important. What do you think the other person might be feeling or needing right now?",
                    "Breakups and relationship changes can feel like grief - because they are. You're mourning what was and what could have been. That's completely natural. How are you taking care of yourself during this transition? 🌸"
                ]
            },

            // Work and career stress
            {
                patterns: ['work', 'job', 'career', 'boss', 'coworker', 'workplace', 'burnout', 'quit', 'fired'],
                responses: [
                    "Work stress can really impact our overall well-being. It's where we spend so much of our time and energy. What's been the most challenging part of your work situation lately? 💼",
                    "Burnout is so real and so common. It's your body and mind's way of saying 'this is too much.' You're not weak for feeling this way - you're human. What would rest and recovery look like for you right now?",
                    "Workplace dynamics can be really complex and stressful. It sounds like you're dealing with a lot. Have you been able to set any boundaries at work, or does it feel like everything bleeds into your personal time?",
                    "Job transitions, whether chosen or not, can bring up a lot of emotions - fear, excitement, uncertainty, relief. What are you feeling most strongly about your work situation right now? 🌱"
                ]
            },

            // Self-care and coping
            {
                patterns: ['self care', 'self-care', 'coping', 'help myself', 'what can i do', 'strategies', 'techniques'],
                responses: [
                    "I love that you're thinking about self-care! It's not selfish - it's necessary. Self-care can be big things or tiny moments. What feels most nurturing to you right now? Maybe a warm bath, a walk outside, calling a friend, or just letting yourself rest? 🌺",
                    "Coping strategies are so personal - what works for one person might not work for another. Some people find movement helpful, others find stillness. Some need social connection, others need solitude. What has your body and mind been craving lately?",
                    "You're being so proactive by asking about this! That shows real self-awareness and strength. Let's think about different areas: physical (movement, rest, nutrition), emotional (journaling, crying, laughing), social (connecting with others), and spiritual (whatever feeds your soul). What resonates most? ✨",
                    "Sometimes the best self-care is just being gentle with ourselves. What would you say to a good friend who was going through what you're going through? Can you offer yourself that same compassion? 💙"
                ]
            },

            // Gratitude and positive moments
            {
                patterns: ['grateful', 'thankful', 'appreciate', 'good day', 'happy', 'joy', 'excited', 'proud'],
                responses: [
                    "It's so beautiful to hear gratitude in your voice! Those positive moments are like little gifts we can hold onto. What specifically has been bringing you joy or peace lately? 🌟",
                    "I'm so glad you're experiencing some happiness! Your joy is contagious, even through our conversation. How does it feel in your body when you're happy? Sometimes paying attention to those sensations can help us recognize and cultivate more joy. ✨",
                    "Celebrating the good moments is so important, especially when life has been challenging. You deserve to feel proud and excited! What would you like to do to honor this positive experience?",
                    "Appreciation and gratitude can be such powerful forces for healing and growth. It sounds like you're in a space to notice the good things, which takes practice and intention. What are you most grateful for in this moment? 🦋"
                ]
            },

            // Physical health and body
            {
                patterns: ['sick', 'pain', 'health', 'body', 'headache', 'stomach', 'chronic', 'medication'],
                responses: [
                    "Physical health and mental health are so connected - when our body hurts, it affects our whole being. It sounds like you're dealing with something challenging. Have you been able to get medical support for what you're experiencing? 🩺",
                    "Chronic pain or illness can be so isolating and exhausting. People don't always understand what it's like to live in a body that's struggling. How are you coping with both the physical and emotional aspects of what you're going through?",
                    "Our bodies hold so much - stress, emotions, memories. Sometimes physical symptoms are our body's way of telling us something important. What do you think your body might be trying to communicate to you right now? 💙",
                    "Taking medication for mental health can bring up a lot of feelings - relief, shame, fear, hope. There's no right or wrong way to feel about it. How has your experience been with finding the right support for your mental health?"
                ]
            },

            // Identity and self-worth
            {
                patterns: ['worthless', 'failure', 'not good enough', 'hate myself', 'identity', 'who am i', 'purpose', 'meaning'],
                responses: [
                    "Those thoughts about not being good enough can be so loud and convincing, but they're not the truth about who you are. You are inherently valuable, just by being human. What would it feel like to treat yourself with the same kindness you'd show a good friend? 💝",
                    "Identity questions can feel so overwhelming, especially during times of transition or struggle. It's actually a sign of growth and self-awareness to question these things. What parts of yourself do you feel most connected to, even when everything else feels uncertain?",
                    "The search for meaning and purpose is one of the most human experiences there is. It's okay not to have all the answers right now. Sometimes meaning emerges from our struggles, our connections, our small acts of kindness. What gives your life meaning, even in small ways? 🌱",
                    "Self-hatred is often the voice of past hurts or harsh critics we've internalized. But that voice doesn't define you. You are worthy of love and compassion, especially from yourself. What would self-compassion look like for you today? 🤗"
                ]
            },

            // General support and validation
            {
                patterns: ['don\'t know', 'confused', 'lost', 'stuck', 'help', 'support', 'listen'],
                responses: [
                    "Not knowing is such an uncomfortable place to be, but it's also a very human one. Sometimes we put pressure on ourselves to have all the answers, but it's okay to sit in the uncertainty for a while. What would it feel like to be gentle with yourself in this not-knowing space? 🌊",
                    "Feeling stuck can be so frustrating, especially when part of us wants to move forward. Sometimes being stuck is our psyche's way of protecting us or telling us we need to rest. What do you think your 'stuckness' might be trying to tell you?",
                    "I'm here to listen, and I'm honored that you're sharing with me. Your feelings and experiences matter. Sometimes just being heard and witnessed can be healing in itself. What feels most important for me to understand about what you're going through? 💙",
                    "Asking for help takes real courage, and you've done that by reaching out. That's actually a sign of strength, not weakness. What does support look like for you? What do you need most right now - someone to listen, practical advice, or just companionship in your feelings? 🤝"
                ]
            }
        ];

        // Find matching pattern
        for (const pattern of patterns) {
            if (pattern.patterns.some(p => message.includes(p))) {
                const responses = pattern.responses;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        }

        // Emotional validation responses for unmatched messages
        const generalResponses = [
            "Thank you for sharing that with me. I can hear that this is important to you. Tell me more about what you're experiencing. 💙",
            "I appreciate you opening up. Your feelings are completely valid. What's been on your mind about this? 🌸",
            "It sounds like you're working through something significant. I'm here to listen and support you. How can I best help you process this? 🤗",
            "I hear you, and I want you to know that whatever you're feeling is okay. Sometimes just talking through things can bring clarity. What feels most pressing for you right now? ✨",
            "Your experience matters, and I'm glad you felt comfortable sharing it with me. What would be most helpful for you in this moment - talking through your feelings, exploring solutions, or just having someone listen? 💝",
            "I can sense that this is weighing on you. Thank you for trusting me with your thoughts. What aspect of this situation feels most challenging right now? 🌻",
        ];

        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }

    static detectCrisis(message) {
        const crisisKeywords = [
            'suicide', 'kill myself', 'end it all', 'not worth living',
            'harm myself', 'hurt myself', 'give up', 'can\'t go on',
            'want to die', 'better off dead', 'no point', 'worthless',
            'end my life', 'kill me', 'don\'t want to be here'
        ];

        return crisisKeywords.some(keyword => 
            message.toLowerCase().includes(keyword)
        );
    }

    static getCrisisResponse() {
        return `I'm really concerned about you, and I want you to know that your life has tremendous value. 🆘 Please reach out for immediate professional help:

🇺🇸 **National Suicide Prevention Lifeline: 988**
🇺🇸 **Crisis Text Line: Text HOME to 741741**
🇬🇧 **Samaritans: 116 123**
🇦🇺 **Lifeline Australia: 13 11 14**
🇨🇦 **Canada Suicide Prevention: 1-833-456-4566**

If you're in immediate danger, please call emergency services: 911 (US), 999 (UK), 000 (AU), or your local emergency number.

You don't have to face this alone. There are people who want to help you through this difficult time. Your life matters. 💙`;
    }

    static getMoodInfluencedResponse(message, mood) {
        // Generate responses that acknowledge current mood
        const moodContexts = {
            happy: {
                affirming: [
                    "I love hearing the positivity in your message! It's wonderful that you're feeling good. ✨",
                    "Your happiness is so refreshing! Let's explore what's contributing to these good feelings. 😊",
                    "It's beautiful when life feels bright like this. What's been the highlight of your day? 🌟"
                ],
                supportive: [
                    "Even when we're feeling happy, it's important to process all our experiences. What's on your mind? 💫",
                    "I'm glad you're in a good space to talk about whatever is concerning you. 🌸"
                ]
            },
            sad: {
                gentle: [
                    "I can hear the sadness in your words, and I want you to know that's completely okay. Let's talk through this together. 💙",
                    "Thank you for sharing with me even when you're feeling down. That takes courage. 🌊",
                    "Sadness can make everything feel heavier. I'm here to sit with you in this feeling. 🤗"
                ]
            },
            anxious: {
                calming: [
                    "I can sense your anxiety, and I want you to know you're safe here with me. Let's take this slowly. 🌸",
                    "Anxiety can make thoughts race. Let's focus on one thing at a time. You're doing great by reaching out. 🦋",
                    "I hear the worry in your message. Let's work through this together, step by step. 💚"
                ]
            },
            angry: {
                validating: [
                    "I can feel the intensity of your emotions, and that's completely valid. Anger often tells us something important. 🔥",
                    "Thank you for sharing your anger with me. These feelings deserve to be heard and understood. ⚡",
                    "Your frustration is coming through clearly, and I want to understand what's driving these feelings. 💪"
                ]
            },
            neutral: {
                accepting: [
                    "Sometimes neutral is exactly where we need to be. There's wisdom in feeling steady. 😌",
                    "I appreciate you sharing from this calm space. What's been on your mind? 🌿",
                    "Neutral feelings are just as valid as intense ones. How can I support you today? 🍃"
                ]
            },
            excited: {
                energetic: [
                    "I can feel your energy and excitement! That's wonderful. Tell me more! ⚡",
                    "Your enthusiasm is contagious! What's got you feeling so energized? 🎉",
                    "I love this excited energy! Let's channel it into our conversation. ✨"
                ]
            }
        };

        if (moodContexts[mood]) {
            const responses = Object.values(moodContexts[mood]).flat();
            return responses[Math.floor(Math.random() * responses.length)];
        }

        return null;
    }

    static analyzeContext(conversationHistory) {
        if (!conversationHistory || conversationHistory.length === 0) {
            return { isFirstTime: true, topics: [], sentimentTrend: 'neutral' };
        }

        // Analyze recent topics and sentiment
        const recentMessages = conversationHistory.slice(-6); // Last 6 messages
        const topics = this.extractTopics(recentMessages);
        const sentimentTrend = this.analyzeSentimentTrend(recentMessages);

        return {
            isFirstTime: false,
            topics: topics,
            sentimentTrend: sentimentTrend,
            messageCount: conversationHistory.length,
            hasSharedMood: conversationHistory.some(msg => msg.mood)
        };
    }

    static extractTopics(messages) {
        const topicKeywords = {
            work: ['work', 'job', 'career', 'boss', 'coworker', 'office', 'business'],
            relationships: ['relationship', 'partner', 'friend', 'family', 'love', 'dating'],
            health: ['health', 'sick', 'pain', 'doctor', 'medication', 'therapy'],
            emotions: ['feel', 'emotion', 'mood', 'happy', 'sad', 'angry', 'anxious'],
            stress: ['stress', 'pressure', 'overwhelm', 'busy', 'deadline', 'burden'],
            self: ['myself', 'identity', 'worth', 'confidence', 'self-esteem']
        };

        const foundTopics = [];
        const messageText = messages.map(m => m.content.toLowerCase()).join(' ');

        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => messageText.includes(keyword))) {
                foundTopics.push(topic);
            }
        }

        return foundTopics;
    }

    static analyzeSentimentTrend(messages) {
        // Simple sentiment analysis based on keywords
        const positiveWords = ['good', 'great', 'happy', 'excited', 'love', 'wonderful', 'amazing'];
        const negativeWords = ['bad', 'terrible', 'sad', 'angry', 'hate', 'awful', 'horrible'];

        let positiveCount = 0;
        let negativeCount = 0;

        messages.forEach(message => {
            const text = message.content.toLowerCase();
            positiveWords.forEach(word => {
                if (text.includes(word)) positiveCount++;
            });
            negativeWords.forEach(word => {
                if (text.includes(word)) negativeCount++;
            });
        });

        if (positiveCount > negativeCount) return 'positive';
        if (negativeCount > positiveCount) return 'negative';
        return 'neutral';
    }

    // Contextual follow-up responses
    static getContextualResponse(context, message) {
        if (context.topics.includes('work') && context.sentimentTrend === 'negative') {
            return "I notice we've been talking about work challenges. How is this affecting other areas of your life? 💼";
        }

        if (context.topics.includes('relationships') && context.messageCount > 3) {
            return "Relationships can be complex. What kind of support would be most helpful as you navigate this? 💕";
        }

        if (context.sentimentTrend === 'negative' && context.messageCount > 5) {
            return "I've noticed you've been working through some difficult feelings. How are you taking care of yourself during this challenging time? 🌸";
        }

        return null;
    }

    // Therapeutic techniques embedded in responses
    static getCognitiveReframingResponse(negativeThought) {
        const reframingPrompts = [
            "I hear that thought, and I wonder - is there another way to look at this situation? What would you tell a friend experiencing the same thing? 🤔",
            "That's a really strong thought. Let's examine it together - what evidence supports this, and what evidence might challenge it? 🔍",
            "Our minds can be very convincing, but sometimes our thoughts aren't facts. What might be a more balanced way to think about this? ⚖️",
            "I notice that thought is causing you pain. What would happen if we approached this with curiosity instead of judgment? 🌱"
        ];

        return reframingPrompts[Math.floor(Math.random() * reframingPrompts.length)];
    }

    static getGroundingResponse() {
        const groundingTechniques = [
            "Let's try a grounding exercise together. Can you name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste? 🌿",
            "I'd like to help you get grounded in this moment. Take a deep breath with me - in for 4 counts, hold for 4, out for 6. Feel your feet on the ground. You're safe right here. 🌊",
            "Let's anchor ourselves in the present. What's the temperature like where you are? What sounds do you hear? What does the air feel like on your skin? 🍃",
            "Grounding can help when emotions feel overwhelming. Try pressing your palms together and noticing the sensation, or hold something with an interesting texture. What do you notice? 👐"
        ];

        return groundingTechniques[Math.floor(Math.random() * groundingTechniques.length)];
    }

    static getValidationResponse() {
        const validationResponses = [
            "Your feelings make complete sense given what you've been through. Thank you for trusting me with this. 💙",
            "I want you to know that your reaction is completely normal and understandable. You're not alone in feeling this way. 🤗",
            "What you're experiencing is so valid. Many people would feel the same way in your situation. Your emotions are telling you something important. 💝",
            "I hear you, and I believe you. Your feelings and experiences matter, and they deserve to be acknowledged. 🌸"
        ];

        return validationResponses[Math.floor(Math.random() * validationResponses.length)];
    }
}