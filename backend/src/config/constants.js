// Application Constants
export const APP_CONFIG = {
    JWT_EXPIRY: '1d',
    PASSWORD_RESET_EXPIRY: 3600000, // 1 hour in milliseconds
    SESSION_AUTO_ATTACH_WINDOW: 120000, // 2 minutes in milliseconds
    SESSION_CLEANUP_WINDOW: 300000, // 5 minutes in milliseconds
    DUPLICATE_SESSION_PREVENTION_WINDOW: 5000, // 5 seconds in milliseconds
};

export const FILE_UPLOAD = {
    MAX_SIZE: 20 * 1024 * 1024, // 20MB
    ALLOWED_TYPES: ['.pdf', '.txt', '.doc', '.docx', '.md'],
};

export const REQUEST_LIMITS = {
    JSON_LIMIT: '10mb',
    URL_ENCODED_LIMIT: '10mb',
};

export const SANDBOX_CONFIG = {
    MEMORY_LIMIT: 128, // MB
    EXECUTION_TIMEOUT: 5000, // milliseconds
};

export const RAG_CONFIG = {
    CHUNK_SIZE: 1000,
    CHUNK_OVERLAP: 200,
    SIMILARITY_THRESHOLD: 0.3,
    MAX_SEARCH_RESULTS: 8,
};

export const DATABASE_POOL = {
    MAX_CONNECTIONS: 20,
    IDLE_TIMEOUT: 30000,
    CONNECTION_TIMEOUT: 2000,
};

export const MODEL_DEFAULTS = {
    TEMPERATURE: 0.7,
    GEMINI_FLASH: 'gemini-flash-latest',
    GEMINI_PRO: 'gemini-pro-latest',
};

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};
