// Global error handler for unhandled promise rejections
// This helps prevent crashes from database timeout errors
// Only works in Node.js runtime, not in Edge Runtime

// Check if we're in Node.js runtime (not Edge Runtime)
// Use try-catch to safely check for process.on availability
let isNodeRuntime = false;
try {
  isNodeRuntime =
    typeof process !== 'undefined' &&
    process !== null &&
    typeof process.on === 'function' &&
    typeof process.env !== 'undefined';
} catch {
  // In Edge Runtime, accessing process.on might throw
  isNodeRuntime = false;
}

if (isNodeRuntime) {
  try {
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
    // Check if it's a database timeout error
    if (
      reason &&
      typeof reason === 'object' &&
      'code' in reason &&
      (reason.code === 'ETIMEDOUT' ||
        reason.code === 'ECONNRESET' ||
        reason.code === 'ENOTFOUND')
    ) {
      console.warn(
        '[DB Error Handler] Caught unhandled database timeout error:',
        reason,
      );
      // Don't crash the app, just log the error
      return;
    }

    // Check if it's a timeout error in the message
    if (
      reason instanceof Error &&
      (reason.message.includes('ETIMEDOUT') ||
        reason.message.includes('timeout') ||
        reason.message.includes('ECONNREFUSED') ||
        reason.message.includes('read ETIMEDOUT'))
    ) {
      console.warn(
        '[DB Error Handler] Caught unhandled database timeout error:',
        reason.message,
      );
      // Don't crash the app, just log the error
      return;
    }

    // For other errors, log them but don't crash in production
    console.error('[Unhandled Rejection]', reason);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
    // Check if it's a database timeout error
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      (error.code === 'ETIMEDOUT' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND')
    ) {
      console.warn(
        '[DB Error Handler] Caught uncaught database timeout error:',
        error,
      );
      // Don't crash the app, just log the error
      return;
    }

    // For other errors, log them
    console.error('[Uncaught Exception]', error);
    });
  } catch (error) {
    // Silently fail in Edge Runtime or if process.on is not available
    // This file is imported but handlers won't be registered
  }
}
