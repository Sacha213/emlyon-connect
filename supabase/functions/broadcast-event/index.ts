// @ts-ignore - Deno runtime remote import
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
// @ts-ignore - Deno runtime remote import
import webpush from "https://esm.sh/web-push@3.6.6";
// @ts-ignore - Deno runtime remote import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Déclaration minimale pour satisfaire TypeScript en environnement Node
// (Deno fournit cet objet à l'exécution réelle de la fonction edge)
declare const Deno: {
    env: {
        get: (key: string) => string | undefined;
    };
};

type PushSubscriptionRow = {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
};

type BroadcastPayload = {
    event: {
        id: string;
        title: string;
        description?: string | null;
        category?: string | null;
        date?: string | number | null;
    };
};

serve(async (req) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    let payload: BroadcastPayload | null = null;
    try {
        payload = await req.json();
    } catch (error) {
        console.error("❌ Invalid JSON payload", error);
        return new Response("Bad Request", { status: 400 });
    }

    if (!payload?.event?.id || !payload?.event?.title) {
        return new Response("Missing event details", { status: 400 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY");
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidContact = Deno.env.get("VAPID_CONTACT_EMAIL") ?? "mailto:contact@example.com";

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("❌ Missing Supabase service credentials");
        return new Response("Server misconfigured", { status: 500 });
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
        console.error("❌ Missing VAPID keys in secrets");
        return new Response("Server misconfigured", { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false }
    });

    const { data: subscriptions, error: subscriptionsError } = await supabase
        .from("PushSubscription")
        .select("endpoint, keys");

    if (subscriptionsError) {
        console.error("❌ Unable to fetch subscriptions", subscriptionsError);
        return new Response("Database error", { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
        console.log("ℹ️ No push subscriptions to notify");
        return new Response(JSON.stringify({ delivered: 0, stale: 0 }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }

    webpush.setVapidDetails(vapidContact, vapidPublicKey, vapidPrivateKey);

    const bodyLines: string[] = [];
    if (payload.event.date) {
        try {
            const date = new Date(payload.event.date);
            bodyLines.push(`📅 ${date.toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`);
        } catch (_error) {
            // ignore parsing issue
        }
    }
    if (payload.event.category) {
        bodyLines.push(`🗂️ ${payload.event.category}`);
    }
    if (payload.event.description) {
        bodyLines.push(payload.event.description.length > 120 ? `${payload.event.description.slice(0, 117)}…` : payload.event.description);
    }

    const notificationPayload = JSON.stringify({
        title: `🎉 ${payload.event.title}`,
        body: bodyLines.length > 0 ? bodyLines.join("\n") : "Nouveau rendez-vous proposé sur emlyon Connect",
        tag: `event-${payload.event.id}`,
        data: {
            url: `/?view=events&eventId=${payload.event.id}`,
            eventId: payload.event.id
        }
    });

    let delivered = 0;
    let stale = 0;

    for (const subscription of subscriptions as PushSubscriptionRow[]) {
        try {
            await webpush.sendNotification(
                {
                    endpoint: subscription.endpoint,
                    keys: subscription.keys
                },
                notificationPayload
            );
            delivered += 1;
        } catch (error) {
            console.error("⚠️ Push send error", error);
            const statusCode = (error as { statusCode?: number }).statusCode;
            if (statusCode === 404 || statusCode === 410) {
                stale += 1;
                await supabase
                    .from("PushSubscription")
                    .delete()
                    .eq("endpoint", subscription.endpoint);
            }
        }
    }

    console.log(`✅ Push broadcast finished. Delivered: ${delivered}, stale removed: ${stale}`);

    return new Response(JSON.stringify({ delivered, stale }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
});
