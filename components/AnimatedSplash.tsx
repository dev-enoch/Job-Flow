import { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    View,
    Image,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface AnimatedSplashProps {
    onComplete: () => void;
}

/**
 * Netflix-style animated splash screen.
 *
 * Sequence:
 *  1. Black background fills the screen
 *  2. Logo scales up from 0.15 → 1.08 (overshoot) → 1.0  (snappy spring feel)
 *  3. Glow ring pulses outward from behind the logo
 *  4. Brief hold at full size (~400 ms)
 *  5. Whole screen fades out → calls onComplete
 */
export default function AnimatedSplash({ onComplete }: AnimatedSplashProps) {
    // Logo scale: tiny → overshoot → settle
    const logoScale = useRef(new Animated.Value(0.12)).current;
    // Logo opacity: appears quickly
    const logoOpacity = useRef(new Animated.Value(0)).current;
    // Glow ring scale
    const glowScale = useRef(new Animated.Value(0.2)).current;
    // Glow ring opacity (fades as it expands)
    const glowOpacity = useRef(new Animated.Value(0.9)).current;
    // Full-screen fade-out at the end
    const containerOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // ── Phase 1: Logo pops in (0 → 130ms)
        Animated.parallel([
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 120,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
            Animated.sequence([
                // Zoom up past 1 (overshoot like Netflix)
                Animated.timing(logoScale, {
                    toValue: 1.08,
                    duration: 350,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
                // Settle back to 1
                Animated.timing(logoScale, {
                    toValue: 1.0,
                    duration: 180,
                    easing: Easing.inOut(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // ── Phase 2: Glow bursts outward simultaneously
        Animated.parallel([
            Animated.timing(glowScale, {
                toValue: 2.6,
                duration: 700,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(glowOpacity, {
                toValue: 0,
                duration: 700,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start();

        // ── Phase 3: Hold then fade out the whole screen
        const holdDelay = 900; // ms after mount before fade
        const fadeDuration = 380;

        const timer = setTimeout(() => {
            Animated.timing(containerOpacity, {
                toValue: 0,
                duration: fadeDuration,
                easing: Easing.in(Easing.quad),
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) onComplete();
            });
        }, holdDelay);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
            {/* Radial glow ring */}
            <Animated.View
                style={[
                    styles.glowRing,
                    {
                        opacity: glowOpacity,
                        transform: [{ scale: glowScale }],
                    },
                ]}
            />

            {/* App logo */}
            <Animated.View
                style={{
                    opacity: logoOpacity,
                    transform: [{ scale: logoScale }],
                    alignItems: "center",
                }}
            >
                <Image
                    source={require("../assets/icons/splash-icon-dark.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />

                {/* "JOBFLOW" wordmark beneath the icon */}
                <Animated.Text style={styles.wordmark}>JOBFLOW</Animated.Text>
            </Animated.View>
        </Animated.View>
    );
}

const LOGO_SIZE = 120;
const GLOW_SIZE = LOGO_SIZE * 1.4;

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },
    glowRing: {
        position: "absolute",
        width: GLOW_SIZE,
        height: GLOW_SIZE,
        borderRadius: GLOW_SIZE / 2,
        backgroundColor: "transparent",
        borderWidth: 28,
        borderColor: "#3b82f6", // Primary brand blue glow
        shadowColor: "#3b82f6",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 40,
        elevation: 20,
    },
    logo: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
    },
    wordmark: {
        marginTop: 18,
        color: "#ffffff",
        fontSize: 26,
        fontFamily: "Inter-Bold",
        letterSpacing: 10,
        textTransform: "uppercase",
    },
});
