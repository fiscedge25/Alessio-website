"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";

interface AnimatedNumberProps {
    value: string;
}

export default function AnimatedNumber({ value }: AnimatedNumberProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    // Extract the numeric part and any suffix (like "+")
    const numMatch = value.match(/\d+/);
    const numericValue = numMatch ? parseInt(numMatch[0], 10) : 0;
    const suffix = value.replace(/\d+/g, "");

    const springValue = useSpring(0, {
        stiffness: 50,
        damping: 20,
        restDelta: 0.5
    });

    const displayValue = useTransform(springValue, (current) =>
        Math.floor(current).toString()
    );

    useEffect(() => {
        if (isInView) {
            springValue.set(numericValue);
        }
    }, [isInView, numericValue, springValue]);

    return (
        <span ref={ref} className="inline-flex">
            <motion.span>{numericValue > 0 ? displayValue : value}</motion.span>
            <span>{suffix}</span>
        </span>
    );
}
