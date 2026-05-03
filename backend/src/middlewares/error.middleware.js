// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error('\n');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('🚨 GLOBAL ERROR HANDLER CAUGHT AN ERROR');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('Time:', new Date().toISOString());
    console.error('Method:', req.method);
    console.error('Path:', req.path);
    let bodyLog = 'No body';
    try {
        bodyLog = JSON.stringify(req.body, null, 2);
    } catch (e) {
        bodyLog = '[Circular or Unserializable Body]';
    }

    console.error('Body:', bodyLog);
    console.error('User:', req.user ? { id: req.user.id, email: req.user.email } : 'Not authenticated');
    console.error('───────────────────────────────────────────────────────────');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Stack:', err.stack);
    console.error('═══════════════════════════════════════════════════════════\n');

    // Send error response
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: err.message || 'Internal Server Error',
        details: err.details || err.message,
        errorType: err.name,
        path: req.path,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// 404 handler
export const notFoundHandler = (req, res, next) => {
    console.warn(`⚠️ 404 Not Found: ${req.method} ${req.path}`);
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        path: req.path
    });
};
