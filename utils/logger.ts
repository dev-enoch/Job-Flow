/**
 * Dev-only logger — all output is suppressed in production builds.
 * Use this instead of console.log / console.error / console.warn directly.
 */
const logger = {
    log: (...args: unknown[]) => {
        if (__DEV__) console.log(...args);
    },
    error: (...args: unknown[]) => {
        if (__DEV__) console.error(...args);
    },
    warn: (...args: unknown[]) => {
        if (__DEV__) console.warn(...args);
    },
};

export default logger;
