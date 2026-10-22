"use client";

import { useEffect } from "react";

interface Props {
    /** Checkout Session id — GA4 deduplicates purchases on it. */
    transactionId: string;
    /** In major units (1.99), pre-tax: Managed Payments collects the tax. */
    value: number;
    currency: string;
    itemId: string;
    itemName: string;
}

/**
 * Sends the GA4 `purchase` event from the success page. The page can be
 * reopened anytime (it's the buyer's receipt), so the event is also guarded
 * per transaction in localStorage on top of GA4's own transaction_id dedup.
 */
export default function PurchaseTracker({ transactionId, value, currency, itemId, itemName }: Props) {
    useEffect(() => {
        const key = `bws:purchase:${transactionId}`;
        try {
            if (localStorage.getItem(key)) return;
        } catch {
            /* storage blocked — rely on GA4's dedup */
        }
        window.gtag?.("event", "purchase", {
            transaction_id: transactionId,
            value,
            currency: currency.toUpperCase(),
            items: [{ item_id: itemId, item_name: itemName, price: value, quantity: 1 }],
        });
        try {
            localStorage.setItem(key, "1");
        } catch {
            /* ignore */
        }
    }, [transactionId, value, currency, itemId, itemName]);

    return null;
}
