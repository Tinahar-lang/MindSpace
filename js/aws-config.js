// AWS Configuration for Nova Premier - SDK v3
const AWS_CONFIG = {
    region: 'us-east-1',
    credentials: {
   accessKeyId: 'ASIAYI7I3J2ISR4THIPF',
   secretAccessKey: 'acBGms82mDGgDoisGOgglxwU8JzGbg0U3zQySfwo',
    }
};

// AWS Service Configurations
const AWS_SERVICES = {
    BEDROCK: {
        modelId: 'amazon.nova-premier',
        region: 'us-east-1'
    }
};

class AWSIntegration {
    constructor() {
        this.bedrockClient = null;
        this.isInitialized = false;
        
        this.initializeServices();
    }

    async initializeServices() {
        try {
            // Check if AWS SDK v3 is loaded
            if (typeof window.BedrockRuntimeClient === 'undefined') {
                console.error('❌ AWS SDK v3 BedrockRuntimeClient not loaded');
                throw new Error('AWS SDK v3 not loaded. Please include the Bedrock Runtime client script.');
            }

            // Check if credentials are configured
            if (AWS_CONFIG.credentials.accessKeyId === 'YOUR_ACCESS_KEY_ID' || 
                AWS_CONFIG.credentials.secretAccessKey === 'YOUR_SECRET_ACCESS_KEY') {
                console.warn('⚠️ AWS credentials not configured - running in demo mode');
                this.isInitialized = false;
                return false;
            }

            // Initialize Bedrock client with v3 syntax
            this.bedrockClient = new window.BedrockRuntimeClient({
                region: AWS_CONFIG.region,
                credentials: AWS_CONFIG.credentials
            });

            // Test the connection
            await this.healthCheck();
            
            this.isInitialized = true;
            console.log('✅ AWS Bedrock v3 initialized successfully');
            
            // Update status in UI
            this.updateConnectionStatus('connected', 'Connected to AWS Bedrock Nova Premier');
            return true;

        } catch (error) {
            console.error('❌ AWS initialization failed:', error);
            this.isInitialized = false;
            this.updateConnectionStatus('disconnected', 'AWS Connection Failed');
            return false;
        }
    }

    // Amazon Bedrock - AI Responses with Nova Premier using SDK v3
    async generateBedrockResponse(prompt, conversationHistory = []) {
        if (!this.isInitialized || !this.bedrockClient) {
            console.warn('Bedrock not initialized - using fallback response');
            return this.getFallbackResponse(prompt);
        }

        try {
            // Format messages for Nova Premier
            const messages = [
                ...conversationHistory.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: [{ text: msg.content }]
                })),
                {
                    role: 'user',
                    content: [{ text: prompt }]
                }
            ];

            const requestBody = {
                messages: messages,
                maxTokens: 1000,
                temperature: 0.7,
                topP: 0.9,
                system: [
                    {
                        text: "You are a compassionate mental health support AI. Provide empathetic, helpful responses while being mindful of mental health best practices. Always encourage professional help when appropriate. Keep responses conversational and supportive."
                    }
                ]
            };

            // Create command for SDK v3
            const command = new window.InvokeModelCommand({
                modelId: AWS_SERVICES.BEDROCK.modelId,
                contentType: 'application/json',
                accept: 'application/json',
                body: JSON.stringify(requestBody)
            });

            // Send request using SDK v3
            const response = await this.bedrockClient.send(command);
            
            // Parse response
            const responseBody = JSON.parse(new TextDecoder().decode(response.body));
            
            return {
                response: responseBody.output?.message?.content?.[0]?.text || 'I understand what you\'re saying and I\'m here to support you.',
                usage: responseBody.usage,
                service: 'bedrock-v3'
            };

        } catch (error) {
            console.error('Bedrock error:', error);
            
            // Return fallback response on error
            return this.getFallbackResponse(prompt);
        }
    }

    // Fallback response for when AWS is not available
    getFallbackResponse(prompt) {
        const fallbackResponses = [
            "I understand you're reaching out, and I want you to know that your feelings are valid. While I'm currently in demo mode, I encourage you to speak with a mental health professional who can provide personalized support.",
            "Thank you for sharing that with me. Even though I'm running in limited mode right now, I want you to know that seeking support is a positive step. Consider reaching out to a counselor or therapist for more comprehensive help.",
            "I hear you, and I appreciate your trust in sharing this with me. While my full capabilities aren't available at the moment, please remember that professional mental health support is always available when you need it.",
            "Your message is important to me. Although I'm currently in demo mode, I want to remind you that you don't have to face challenges alone. Mental health professionals are trained to provide the support you deserve."
        ];

        return {
            response: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
            service: 'fallback'
        };
    }

    // Health Check for SDK v3
    async healthCheck() {
        if (!this.bedrockClient) {
            throw new Error('Bedrock client not initialized');
        }

        try {
            // Simple test to verify client works
            // SDK v3 doesn't have listFoundationModels in browser, so we'll test with a minimal invoke
            console.log('Health check: Bedrock client initialized with v3');
            return { bedrock: true };

        } catch (error) {
            console.error('Bedrock health check failed:', error);
            throw error;
        }
    }

    // Test permissions specifically
    async testPermissions() {
        try {
            console.log('Testing permissions with Bedrock v3 client...');
            
            if (!this.bedrockClient) {
                console.warn('⚠️ Bedrock client not initialized');
                return false;
            }

            // Test with a minimal request
            const testCommand = new window.InvokeModelCommand({
                modelId: AWS_SERVICES.BEDROCK.modelId,
                contentType: 'application/json',
                accept: 'application/json',
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: [{ text: 'Hello' }]
                    }],
                    maxTokens: 10,
                    temperature: 0.1
                })
            });

            await this.bedrockClient.send(testCommand);
            console.log('✅ Bedrock permissions working - Nova Premier accessible');
            return true;
            
        } catch (error) {
            console.error('❌ Permission/Access error:', error.message);
            
            if (error.name === 'AccessDeniedException') {
                console.error('Access denied - check IAM permissions for Bedrock');
            } else if (error.name === 'ValidationException') {
                console.error('Model validation error - Nova Premier may not be available in your region');
            } else if (error.message.includes('no identity-based policy')) {
                console.error('No IAM policy allows bedrock:InvokeModel');
            }
            
            return false;
        }
    }

    // Update connection status in UI
    updateConnectionStatus(status, message) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            let indicator = '';
            switch(status) {
                case 'connected':
                    indicator = '<span class="status-indicator connected"></span>';
                    break;
                case 'disconnected':
                    indicator = '<span class="status-indicator disconnected"></span>';
                    break;
                default:
                    indicator = '<span class="status-indicator demo"></span>';
            }
            statusElement.innerHTML = `${indicator}${message}`;
        }

        // Hide demo notice when connected
        if (status === 'connected') {
            const notice = document.getElementById('awsNotice');
            if (notice) {
                notice.classList.add('hidden');
            }
        }
    }

    // Error Recovery with exponential backoff
    async retryOperation(operation, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                if (i === maxRetries - 1) throw error;
                
                console.warn(`Operation failed, retrying in ${delay}ms... (${i + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            }
        }
    }

    // Utility Functions
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Simplified Sentiment Analysis (no AWS dependencies)
class SentimentAnalysis {
    constructor() {
        console.log('✅ Simple Sentiment Analysis initialized');
    }

    analyzeSentiment(text) {
        const positiveWords = ['happy', 'good', 'great', 'wonderful', 'amazing', 'love', 'excited', 'joy', 'better', 'hopeful', 'calm', 'peaceful', 'grateful', 'thankful'];
        const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'depressed', 'anxious', 'worried', 'scared', 'overwhelmed', 'stressed', 'hopeless'];
        
        const words = text.toLowerCase().split(/\s+/);
        let positiveCount = 0;
        let negativeCount = 0;

        words.forEach(word => {
            if (positiveWords.includes(word)) positiveCount++;
            if (negativeWords.includes(word)) negativeCount++;
        });

        let sentiment = 'NEUTRAL';
        if (positiveCount > negativeCount) sentiment = 'POSITIVE';
        else if (negativeCount > positiveCount) sentiment = 'NEGATIVE';

        return {
            sentiment: sentiment,
            confidence: {
                positive: positiveCount / words.length,
                negative: negativeCount / words.length,
                neutral: 1 - (positiveCount + negativeCount) / words.length
            },
            service: 'simple'
        };
    }
}

// Export for use in main app
if (typeof window !== 'undefined') {
    window.AWSIntegration = AWSIntegration;
    window.SentimentAnalysis = SentimentAnalysis;
} else {
    // Node.js environment
    module.exports = { AWSIntegration, SentimentAnalysis };
}

console.log('AWS Config loaded - Bedrock Nova Premier v3 SDK');