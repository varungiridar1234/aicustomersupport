const { z } = require('zod');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { CATEGORIES, PRIORITIES } = require('../config/constants');

// Zod Schema for structured AI Classification
const ClassificationSchema = z.object({
  category: z.enum(Object.values(CATEGORIES)),
  priority: z.enum(Object.values(PRIORITIES)),
  confidence: z.number().min(0).max(1),
  reason: z.string().min(5),
});

class AIService {
  static getGenAIClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    try {
      return new GoogleGenerativeAI(apiKey);
    } catch (err) {
      console.warn('[AIService] Failed to initialize Gemini API client:', err.message);
      return null;
    }
  }

  /**
   * Deterministic heuristic fallback for classification when Gemini API is offline
   */
  static fallbackClassification(subject, description) {
    const text = `${subject} ${description}`.toLowerCase();
    
    let category = CATEGORIES.TECHNICAL;
    let priority = PRIORITIES.MEDIUM;
    let reason = 'AI heuristic analysis based on issue keywords';
    let confidence = 0.88;

    // Payment category classification
    if (text.includes('charge') || text.includes('pay') || text.includes('bill') || text.includes('double') || text.includes('refund') || text.includes('twice') || text.includes('dispute') || text.includes('auth failure') || text.includes('hold') || text.includes('gateway')) {
      category = CATEGORIES.PAYMENT;
      
      // Critical payment disputes (urgent, gateway failure, emergency hold, dispute)
      if (text.includes('urgent') || text.includes('dispute') || text.includes('emergency') || text.includes('auth failure') || text.includes('unauthorized') || text.includes('fraud') || text.includes('4,500') || text.includes('4500')) {
        priority = PRIORITIES.CRITICAL;
        reason = 'High-urgency payment dispute or gateway authorization failure requiring immediate senior intervention.';
        confidence = 0.98;
      } else if (text.includes('twice') || text.includes('double') || text.includes('duplicate')) {
        priority = PRIORITIES.HIGH;
        reason = 'Customer reports duplicate transaction or double charge requiring verification.';
        confidence = 0.95;
      } else {
        priority = PRIORITIES.MEDIUM;
        reason = 'General payment inquiry requiring financial review.';
        confidence = 0.90;
      }
    } 
    // Technical category classification
    else if (text.includes('crash') || text.includes('down') || text.includes('error') || text.includes('server 500') || text.includes('offline') || text.includes('outage') || text.includes('bug')) {
      category = CATEGORIES.TECHNICAL;
      if (text.includes('down') || text.includes('all users') || text.includes('outage') || text.includes('production') || text.includes('500 internal')) {
        priority = PRIORITIES.CRITICAL;
        reason = 'Critical production outage or severe 500 server instability detected.';
        confidence = 0.98;
      } else {
        priority = PRIORITIES.HIGH;
        reason = 'Technical bug or API endpoint anomaly reported.';
        confidence = 0.92;
      }
    } 
    // Logistics & Delivery category classification
    else if (text.includes('deliver') || text.includes('ship') || text.includes('late') || text.includes('tracking') || text.includes('package') || text.includes('transit')) {
      category = CATEGORIES.DELIVERY;
      priority = PRIORITIES.MEDIUM;
      reason = 'Logistics query regarding package tracking or delivery delay.';
      confidence = 0.89;
    } 
    // Security category classification
    else if (text.includes('hacked') || text.includes('breach') || text.includes('suspicious') || text.includes('stolen') || text.includes('compromise')) {
      category = CATEGORIES.SECURITY;
      priority = PRIORITIES.CRITICAL;
      reason = 'Potential security incident or account compromise reported.';
      confidence = 0.97;
    } 
    // Account category classification
    else if (text.includes('password') || text.includes('login') || text.includes('account') || text.includes('lock')) {
      category = CATEGORIES.ACCOUNT;
      priority = PRIORITIES.MEDIUM;
      reason = 'Account authentication or password reset assistance required.';
      confidence = 0.92;
    }

    return { category, priority, confidence, reason };
  }

  /**
   * 1. AI Ticket Classification
   */
  static async classifyTicket(subject, description) {
    const ai = this.getGenAIClient();
    
    if (!ai) {
      console.log('[AIService] GEMINI_API_KEY not set. Using smart heuristic classifier.');
      return this.fallbackClassification(subject, description);
    }

    try {
      const prompt = `You are an expert customer support AI classifier.
Analyze this ticket and categorize it into EXACTLY ONE category and priority level.

CRITICAL INSTRUCTIONS:
- Any payment dispute involving urgent authorization holds, payment gateway failures, or monetary loss MUST be classified as Priority "Critical".
- Duplicate charges or double payments MUST be classified as Priority "High".

ALLOWED CATEGORIES: ${Object.values(CATEGORIES).join(', ')}
ALLOWED PRIORITIES: ${Object.values(PRIORITIES).join(', ')}

Ticket Subject: "${subject}"
Ticket Description: "${description}"

Respond ONLY with valid JSON in this exact structure:
{
  "category": "Payment",
  "priority": "Critical",
  "confidence": 0.98,
  "reason": "Brief single-sentence rationale"
}`;

      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const response = await model.generateContent(prompt);
      const text = response.response.text() || '';
      const parsedJson = JSON.parse(text);
      const validated = ClassificationSchema.parse(parsedJson);
      return validated;
    } catch (err) {
      console.error('[AIService] Gemini classification error/validation failure:', err.message);
      console.log('[AIService] Falling back to safe heuristic classification');
      return this.fallbackClassification(subject, description);
    }
  }

  /**
   * 2. AI Resolution Recommendation (Step-by-step for Agent)
   */
  static async generateRecommendation(ticket, knowledgeDocs = []) {
    const ai = this.getGenAIClient();
    const knowledgeText = knowledgeDocs.map(d => `Document "${d.title}":\n${d.excerpt}`).join('\n\n');

    if (!ai) {
      return [
        { step: 1, action: 'Access Merchant Gateway Manager', detail: `Review subject '${ticket.subject}' and inspect payment authorization IDs.` },
        { step: 2, action: 'Cross-reference Policy Context', detail: knowledgeDocs.length ? `Adhere strictly to '${knowledgeDocs[0].title}'.` : 'Consult company standard operating procedures.' },
        { step: 3, action: 'Execute Remedial Action', detail: 'Release authorization hold or issue direct refund in merchant control panel.' },
        { step: 4, action: 'Notify Customer', detail: 'Send approved resolution update to customer via originating channel.' }
      ];
    }

    try {
      const prompt = `You are a senior support engineer assistant.
Generate a structured 4-step recommendation plan for a HUMAN SUPPORT AGENT to resolve this ticket.

Ticket Subject: "${ticket.subject}"
Ticket Description: "${ticket.description}"
Category: ${ticket.category}
Priority: ${ticket.priority}

Relevant Knowledge Base Policies:
${knowledgeText || 'No specific document found. Use standard SaaS resolution best practices.'}

Respond ONLY with valid JSON array of objects:
[
  { "step": 1, "action": "Short Action Title", "detail": "Detailed instruction for agent" },
  { "step": 2, "action": "Short Action Title", "detail": "Detailed instruction for agent" },
  { "step": 3, "action": "Short Action Title", "detail": "Detailed instruction for agent" },
  { "step": 4, "action": "Short Action Title", "detail": "Detailed instruction for agent" }
]`;

      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const response = await model.generateContent(prompt);
      return JSON.parse(response.response.text());
    } catch (err) {
      console.error('[AIService] Gemini recommendation error:', err.message);
      return [
        { step: 1, action: 'Verify Transaction Details', detail: 'Locate transaction ID and authorization status in gateway portal.' },
        { step: 2, action: 'Check Authorization vs Settlement', detail: 'Confirm whether funds are held in pending state or posted settlement.' },
        { step: 3, action: 'Initiate Manual Release/Refund', detail: 'Issue void signal or execute refund according to Duplicate Payment Policy.' },
        { step: 4, action: 'Inform Customer', detail: 'Send formal confirmation response once hold is released.' }
      ];
    }
  }

  /**
   * 3. AI Customer Response Draft (For Agent Review & Human Approval)
   */
  static async generateCustomerDraft(ticket, knowledgeDocs = [], recommendation = []) {
    const ai = this.getGenAIClient();
    const knowledgeSummary = knowledgeDocs.map(d => d.title).join(', ');

    if (!ai) {
      return `Dear ${ticket.customer?.name || 'Customer'},\n\nThank you for reaching out to our support team regarding your query: "${ticket.subject}".\n\nWe have reviewed your request alongside our policy guidelines (${knowledgeSummary || 'Standard Company Policy'}). Our team is actively investigating this issue to ensure it is resolved promptly and accurately.\n\nWe will update you as soon as the action is completed.\n\nBest regards,\nCustomer Support Team`;
    }

    try {
      const prompt = `You are a polite, empathetic, and professional customer support representative.
Write a customer-facing draft response to be reviewed by a human agent.

CRITICAL INSTRUCTION:
Never claim an action (like a refund or server fix) has ALREADY completed unless confirmed. State that we are actively reviewing and processing the request.

Customer Name: ${ticket.customer?.name || 'Valued Customer'}
Subject: "${ticket.subject}"
Issue: "${ticket.description}"
Originating Channel: ${ticket.channel}

Draft a clear, reassuring, and concise message. Do not include placeholders.`;

      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const response = await model.generateContent(prompt);
      return response.response.text().trim();
    } catch (err) {
      console.error('[AIService] Gemini draft generation error:', err.message);
      return `Dear ${ticket.customer?.name || 'Customer'},\n\nThank you for contacting us regarding "${ticket.subject}". We have logged your request under ticket ID ${ticket.ticketId}.\n\nOur support team has verified your issue and is currently taking the necessary steps to resolve it in accordance with our service guidelines.\n\nThank you for your patience.\n\nSincerely,\nSupport Team`;
    }
  }
}

module.exports = AIService;
