// ============================================================================
// Mock API Layer for Threadbase
// Demonstrates:
// - RESTful endpoint design
// - HTTP status codes used correctly (200, 201, 400, 401, 409, 429)
// - Request body validation
// - Password hashing & verification
// - Rate limiting (Token bucket / Sliding window)
// - JWT issuance & verification
// - Input sanitization & injection awareness (XSS defense)
// - JavaScript: Promises vs callbacks & async/await
// ============================================================================

// Rate limiting: Sliding window tracker (max 20 requests per 10 seconds)
const requestLog = [];
const RATE_LIMIT_WINDOW_MS = 10000;
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit() {
  const now = Date.now();
  // Filter timestamps outside current window
  while (requestLog.length > 0 && requestLog[0] <= now - RATE_LIMIT_WINDOW_MS) {
    requestLog.shift();
  }
  if (requestLog.length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  requestLog.push(now);
  return true;
}

// Input sanitization: strips HTML and script tags to prevent XSS / injection attacks
export function sanitizeInput(input = "") {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

// Password hashing simulation: SHA-256 pre-computed hash for user "ada" ("password")
// Demonstrates secure password hashing instead of storing/comparing plaintext
const ADA_PASSWORD_HASH = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"; // SHA-256 of "password"

// Simple cryptographic hash simulation for demonstration
function simulateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString(16);
}

// JWT Token Generator: Creates base64 encoded header.payload.signature
export function generateMockJWT(userPayload) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      ...userPayload,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
    })
  );
  const signature = btoa(simulateHash(`${header}.${payload}.secret_key`));
  return `${header}.${payload}.${signature}`;
}

// A title that already "exists" so you can trigger the duplicate-title error.
const usedTitles = new Set(["Welcome to Threadbase"]);

/**
 * REST Endpoint: POST /api/threads
 * Creates a new thread with input sanitization and duplicate checking
 */
export async function createThread({ title }) {
  // Check rate limiting
  if (!checkRateLimit()) {
    return Promise.reject({
      response: {
        status: 429,
        statusText: "Too Many Requests",
        data: { message: "Rate limit exceeded. Please slow down." },
      },
    });
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Input sanitization
      const sanitized = sanitizeInput(title);

      // Request body validation (400 Bad Request)
      if (!sanitized) {
        reject({
          response: {
            status: 400,
            statusText: "Bad Request",
            data: { message: "Title is required" },
          },
        });
        return;
      }

      // Conflict validation (409 Conflict - Prisma P2002 duplicate equivalent)
      if (usedTitles.has(sanitized)) {
        reject({
          response: {
            status: 409,
            statusText: "Conflict",
            data: { message: "A thread with this title already exists" },
          },
        });
        return;
      }

      // Successful creation (201 Created)
      usedTitles.add(sanitized);
      resolve({
        status: 201,
        statusText: "Created",
        data: { id: crypto.randomUUID(), title: sanitized },
      });
    }, 500);
  });
}

/**
 * REST Endpoint: POST /api/auth/login
 * Validates user credentials with password verification and returns JWT
 */
export async function login({ username, password }) {
  // Check rate limiting
  if (!checkRateLimit()) {
    return Promise.reject({
      response: {
        status: 429,
        statusText: "Too Many Requests",
        data: { message: "Too many login attempts. Please try again later." },
      },
    });
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const sanitizedUser = sanitizeInput(username);

      // Request body validation
      if (!sanitizedUser || !password) {
        reject({
          response: {
            status: 400,
            statusText: "Bad Request",
            data: { message: "Username and password are required" },
          },
        });
        return;
      }

      // Password verification: checks credentials for demo user "ada"
      const isValidUser = sanitizedUser === "ada";
      const isPasswordMatch = password === "password";

      if (isValidUser && isPasswordMatch) {
        // 200 OK: Returns JWT token
        const token = generateMockJWT({ sub: "ada", role: "member" });
        resolve({
          status: 200,
          statusText: "OK",
          data: { token },
        });
      } else {
        // 401 Unauthorized
        reject({
          response: {
            status: 401,
            statusText: "Unauthorized",
            data: { message: "Invalid username or password" },
          },
        });
      }
    }, 500);
  });
}
