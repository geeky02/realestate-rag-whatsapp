import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

// Webhook endpoint for Evolution API
http.route({
  path: "/whatsapp/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();

      // Extract message data from Evolution API webhook
      const { 
        data, 
        event 
      } = body;

      // Handle different event types
      if (event === "messages.upsert") {
        const message = data.message || data;
        
        // Extract message details
        const fromPhone = message.key?.remoteJid?.replace("@s.whatsapp.net", "");
        const messageContent = 
          message.message?.conversation ||
          message.message?.extendedTextMessage?.text ||
          message.message?.imageMessage?.caption ||
          "";

        let messageType = "text";
        let mediaUrl = undefined;

        // Detect message type
        if (message.message?.imageMessage) {
          messageType = "image";
          mediaUrl = message.message.imageMessage.url;
        } else if (message.message?.audioMessage) {
          messageType = "audio";
          mediaUrl = message.message.audioMessage.url;
        } else if (message.message?.documentMessage) {
          messageType = "document";
          mediaUrl = message.message.documentMessage.url;
        }

        // Get first broker (in production, route to correct broker)
        const brokers = await ctx.runQuery(api.internal.getFirstBrokerPublic, {});
        
        if (!brokers || brokers.length === 0) {
          return new Response("No brokers configured", { status: 500 });
        }

        const brokerId = brokers[0]._id;

        // Process incoming message
        await ctx.runMutation(internal.whatsapp.processIncomingMessage, {
          fromPhone,
          messageType,
          content: messageContent,
          mediaUrl,
          whatsappMessageId: message.key.id,
          brokerId,
          metadata: { rawMessage: message },
        });

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Handle status updates
      if (event === "messages.update") {
        const status = data.status;
        const messageId = data.key?.id;

        if (messageId) {
          await ctx.runMutation(api.whatsapp.updateMessageStatus, {
            whatsappMessageId: messageId,
            status,
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Return success for other events
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : "Unknown error" 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ 
        status: "ok", 
        timestamp: Date.now() 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

export default http;

