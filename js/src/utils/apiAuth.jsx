// utils/apiAuth.js - COMPLETE PRODUCTION-READY VERSION
class ApiAuth {
 constructor() {
  const hostname = window.location.hostname;

  this.isLocal = hostname === "localhost";
  this.isTestServer = hostname.includes("ktfrancesrv2");
  this.isProduction = hostname.includes("ktflceprd");

  if (this.isProduction) {
    // ✅ PRODUCTION
    this.baseURL = "https://ktflceprd.kalyanicorp.com";
    this.username = "kalyaniadmin";
    this.password = "kalyaniadmin@7001";
    this.requiresCSRF = true;

  } else if (this.isTestServer) {
    // ✅ TEST
    this.baseURL = "https://ktfrancesrv2.kalyanicorp.com";
    this.username = "caddok";
    this.password = "";
    this.requiresCSRF = true;

  } else {
    // ✅ LOCAL
    this.baseURL = "http://localhost:8080";
    this.username = "";
    this.password = "";
    this.requiresCSRF = false;
  }

  this.csrfTokens = {};
  this.debugMode = true;

  console.log(`🚀 Environment: ${
    this.isProduction
      ? "PRODUCTION"
      : this.isTestServer
      ? "TEST"
      : "LOCAL"
  }`);
}

 
  // 🔐 Basic Auth Header - only for production
  getBasicAuthHeader() {
    if (!this.requiresCSRF) return null;
    const credentials = btoa(`${this.username}:${this.password}`);
    return `Basic ${credentials}`;
  }
 
  // 🍪 Extract CSRF from response - FIXED VERSION
  async extractCSRFToken(response) {
    console.log("🔍 === CSRF EXTRACTION DEBUG START ===");
    console.log("📡 Response status:", response.status);
    console.log("📡 Response ok:", response.ok);
    console.log("📡 Response type:", response.type);
    console.log("📡 Response url:", response.url);
 
    console.log("📋 ALL Response headers:");
    const headers = {};
    for (const [name, value] of response.headers.entries()) {
      headers[name] = value;
      console.log(`  ${name}: ${value}`);
    }
 
    // Method 1: Check various header formats
    console.log("🔍 Method 1: Checking CSRF in headers...");
    let token =
      response.headers.get("x-csrf-token") ||
      response.headers.get("X-CSRFToken") ||
      response.headers.get("X-CSRF-TOKEN") ||
      response.headers.get("csrf-token") ||
      response.headers.get("CSRF-Token") ||
      response.headers.get("csrftoken") ||
      response.headers.get("CSRFtoken");
 
    if (token) {
      console.log("✅ CSRF found in headers:", token);
      console.log("🔍 === CSRF EXTRACTION DEBUG END ===");
      return token;
    } else {
      console.log("❌ No CSRF token found in headers");
    }
 
    // Method 2: Parse Set-Cookie headers - FIXED METHOD
    console.log("🔍 Method 2: Checking CSRF in cookies...");
 
    // NEW: Try to get all set-cookie values using entries()
    const allSetCookies = [];
    for (const [name, value] of response.headers.entries()) {
      if (name.toLowerCase() === 'set-cookie') {
        allSetCookies.push(value);
        console.log(`🍪 Found Set-Cookie header: ${value}`);
      }
    }
 
    if (allSetCookies.length > 0) {
      console.log(`🔍 Processing ${allSetCookies.length} Set-Cookie headers...`);
 
      for (let i = 0; i < allSetCookies.length; i++) {
        const cookieHeader = allSetCookies[i];
        console.log(`🔍 Checking Set-Cookie ${i + 1}: ${cookieHeader}`);
 
        // Look for CSRFToken in this cookie header
        const csrfMatch = cookieHeader.match(/CSRFToken=([^;]+)/i);
        if (csrfMatch) {
          token = csrfMatch[1];
          console.log("✅ CSRF found in Set-Cookie header:", token);
          console.log("🔍 === CSRF EXTRACTION DEBUG END ===");
          return token;
        }
      }
 
      console.log("❌ No CSRFToken found in any Set-Cookie headers");
    } else {
      console.log("❌ No Set-Cookie headers found at all");
    }
 
    // Method 3: Fallback - parse document.cookie if available
    console.log("🔍 Method 3: Checking browser cookies as fallback...");
    try {
      if (typeof document !== 'undefined' && document.cookie) {
        console.log("🍪 Document cookies:", document.cookie);
        const cookieMatch = document.cookie.match(/CSRFToken=([^;]+)/i);
        if (cookieMatch) {
          token = cookieMatch[1];
          console.log("✅ CSRF found in document.cookie:", token);
          console.log("🔍 === CSRF EXTRACTION DEBUG END ===");
          return token;
        }
      }
    } catch (e) {
      console.log("❌ Could not access document.cookie:", e.message);
    }
 
    // Method 4: Check if response has JSON body with CSRF
    console.log("🔍 Method 4: Checking CSRF in JSON body...");
    try {
      const responseClone = response.clone();
      const contentType = response.headers.get("content-type");
      console.log("🔍 Content-Type:", contentType);
 
      if (contentType && contentType.includes("application/json")) {
        const data = await responseClone.json();
        console.log("📦 JSON Response data:", data);
 
        if (data.csrfToken || data.csrf_token || data.CSRFToken) {
          token = data.csrfToken || data.csrf_token || data.CSRFToken;
          console.log("✅ CSRF found in JSON body:", token);
          console.log("🔍 === CSRF EXTRACTION DEBUG END ===");
          return token;
        } else {
          console.log("❌ No CSRF token in JSON data");
        }
      } else {
        console.log("❌ Response is not JSON");
      }
    } catch (e) {
      console.log("❌ Could not parse JSON body for CSRF:", e.message);
    }
 
    console.log("❌❌❌ CSRF token not found anywhere!");
    console.log("🔍 === CSRF EXTRACTION DEBUG END ===");
    return null;
  }
 
  // 🎯 Fetch CSRF for a specific endpoint
  async fetchCSRFTokenFor(endpoint) {
    console.log("🔍 === CSRF FETCH DEBUG START ===");
    console.log(`🔍 Attempting to fetch CSRF from: ${this.baseURL}${endpoint}`);
    console.log(`🔍 Using credentials: ${this.username}:${this.password ? '[PASSWORD_SET]' : '[NO_PASSWORD]'}`);
 
    try {
      const requestUrl = `${this.baseURL}${endpoint}`;
      const requestHeaders = {
        Authorization: this.getBasicAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      };
 
      console.log("📤 CSRF Request details:");
      console.log("  URL:", requestUrl);
      console.log("  Headers:", requestHeaders);
      console.log("  Method: GET");
      console.log("  Credentials: include");
      console.log("  Mode: cors");
 
      const response = await fetch(requestUrl, {
        method: "GET",
        headers: requestHeaders,
        credentials: "include", // Important for cookies
        mode: "cors", // Explicitly set CORS mode
      });
 
      console.log(`📡 CSRF Fetch Response Status: ${response.status} ${response.statusText}`);
      console.log(`📡 Response OK: ${response.ok}`);
      console.log(`📡 Response Type: ${response.type}`);
 
      if (!response.ok) {
        console.log("❌ CSRF fetch response not OK, but continuing to check for token...");
        // Don't throw error yet, still try to extract CSRF
      }
 
      const token = await this.extractCSRFToken(response);
 
      if (token) {
        this.csrfTokens[endpoint] = token;
        console.log(`✅ CSRF Token successfully cached for ${endpoint}:`, token);
        console.log("🔍 === CSRF FETCH DEBUG END ===");
        return token;
      }
 
      console.log("❌❌❌ No CSRF token found in response!");
      console.log("🔍 === CSRF FETCH DEBUG END ===");
      throw new Error("CSRF token not found in response");
    } catch (error) {
      console.log("❌❌❌ CSRF fetch completely failed!");
      console.log("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      console.log("🔍 === CSRF FETCH DEBUG END ===");
      throw error;
    }
  }
 
  // 🔧 Build headers for GET
  getGetHeaders() {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
 
    // Only add auth for production
    if (this.requiresCSRF) {
      headers.Authorization = this.getBasicAuthHeader();
    }
 
    return headers;
  }
 
  // 🔧 Build headers for POST/PUT/PATCH/DELETE
  async getModifyingHeaders(endpointForCSRF) {
    console.log("🔍 === GETTING MODIFYING HEADERS DEBUG START ===");
    console.log(`🔍 Getting headers for endpoint: ${endpointForCSRF}`);
    console.log(`🔍 Environment: ${this.isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
    console.log(`🔍 Requires CSRF: ${this.requiresCSRF}`);
 
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
 
    // Only add auth and CSRF for production
    if (this.requiresCSRF) {
      headers.Authorization = this.getBasicAuthHeader();
 
      // Get CSRF token
      let token = this.csrfTokens[endpointForCSRF];
      console.log(`🔍 Cached CSRF for ${endpointForCSRF}:`, token || "NOT FOUND");
 
      if (!token) {
        console.log(`🔄 No cached CSRF for ${endpointForCSRF}, fetching...`);
        try {
          token = await this.fetchCSRFTokenFor(endpointForCSRF);
          console.log("✅ Successfully fetched CSRF:", token);
        } catch (error) {
          console.log("❌ Failed to fetch CSRF:", error.message);
          throw error;
        }
      }
 
      if (token) {
        headers["X-Csrf-Token"] = token;  // This is the correct format your server expects
        console.log("🔍 Final headers with CSRF:", headers);
      } else {
        console.log("⚠️ No CSRF token available, sending headers without CSRF");
      }
    } else {
      console.log("🔍 Development mode - skipping CSRF and auth");
    }
 
    console.log("🔍 Final headers:", headers);
    console.log("🔍 === GETTING MODIFYING HEADERS DEBUG END ===");
    return headers;
  }
 
  // ✅ Enhanced handleResponse method with better error extraction
  async handleResponse(response) {
    console.log("🔍 === RESPONSE HANDLING DEBUG START ===");
    console.log("📡 Response status:", response.status);
    console.log("📡 Response ok:", response.ok);
    console.log("📡 Response statusText:", response.statusText);
 
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      console.log("📡 Content-Type:", contentType);
 
      let errorMessage = `Request failed with status: ${response.status} ${response.statusText}`;
      let errorDetails = null;
 
      try {
        if (contentType && contentType.includes("application/json")) {
          errorDetails = await response.json();
          console.log("📦 Error response JSON:", JSON.stringify(errorDetails, null, 2));
 
          // ✅ FIXED: Better error extraction for nested errors
          if (errorDetails.error) {
            // Handle nested error object
            if (typeof errorDetails.error === 'object') {
              errorMessage =
                errorDetails.error.message ||
                errorDetails.error.innererror?.message ||
                errorDetails.error.innererror?.trace?.split('\n')?.[0] || // Get first line of trace
                JSON.stringify(errorDetails.error);
 
              // Log the full trace if available
              if (errorDetails.error.innererror?.trace) {
                console.error("📋 Full server error trace:");
                console.error(errorDetails.error.innererror.trace);
 
                // Extract the actual error from trace
                const traceLines = errorDetails.error.innererror.trace.split('\n');
                const errorLine = traceLines[traceLines.length - 1]; // Usually last line
                if (errorLine && errorLine.includes('Error:')) {
                  errorMessage = errorLine.trim();
                }
              }
            } else {
              errorMessage = String(errorDetails.error);
            }
          } else {
            // Try other common error properties
            errorMessage =
              errorDetails.message ||
              errorDetails.detail ||
              errorDetails.msg ||
              errorMessage;
          }
 
          console.log("🔍 Extracted error message:", errorMessage);
        } else {
          const errorText = await response.text();
          console.log("📄 Error response text:", errorText);
          if (errorText) errorMessage = errorText;
        }
      } catch (parseError) {
        console.warn("⚠️ Could not parse error response:", parseError);
      }
 
      console.log("🔍 === RESPONSE HANDLING DEBUG END ===");
 
      // Create error with both message and details
      const error = new Error(errorMessage);
      error.status = response.status;
      error.statusText = response.statusText;
      error.details = errorDetails;
 
      if (this.debugMode) {
        console.error("❌ Throwing error:", {
          message: errorMessage,
          status: response.status,
          statusText: response.statusText,
          details: errorDetails
        });
      }
 
      throw error;
    }
 
    console.log("✅ Response OK");
    console.log("🔍 === RESPONSE HANDLING DEBUG END ===");
    return response;
  }
 
  // 🔄 Enhanced retry with new CSRF
  async retryWithNewCSRF(requestFn, endpoint) {
    console.log("🔍 === RETRY LOGIC DEBUG START ===");
    console.log(`🔍 Attempting request for endpoint: ${endpoint}`);
 
    try {
      const result = await requestFn();
      console.log("✅ Request succeeded on first try");
      console.log("🔍 === RETRY LOGIC DEBUG END ===");
      return result;
    } catch (error) {
      console.log("❌ First request failed:", error.message);
      console.log("🔍 Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n')[0] // Just first line of stack
      });
 
      const is403Error =
        error.message.includes("403") ||
        error.message.includes("Forbidden");
      const isCSRFError =
        error.message.includes("CSRF") ||
        error.message.includes("csrf") ||
        error.message.includes("419") ||
        error.message.includes("Token");
 
      console.log("🔍 Error type analysis:");
      console.log("  Is 403 Error:", is403Error);
      console.log("  Is CSRF Error:", isCSRFError);
 
      if (is403Error || isCSRFError) {
        console.log("🔄 Detected CSRF/403 error - attempting retry with new token...");
 
        // Clear cached token and fetch fresh one
        console.log(`🗑️ Clearing cached CSRF for ${endpoint}`);
        this.csrfTokens[endpoint] = null;
 
        try {
          console.log("🔄 Fetching fresh CSRF token...");
          await this.fetchCSRFTokenFor(endpoint);
 
          console.log("🔄 Retrying original request with fresh CSRF...");
          const result = await requestFn();
          console.log("✅ Retry succeeded!");
          console.log("🔍 === RETRY LOGIC DEBUG END ===");
          return result;
        } catch (retryError) {
          console.log("❌❌❌ Retry also failed:", retryError.message);
          console.log("🔍 === RETRY LOGIC DEBUG END ===");
          throw new Error(`Request failed after CSRF retry: ${retryError.message}`);
        }
      }
 
      console.log("❌ Error is not CSRF-related, not retrying");
      console.log("🔍 === RETRY LOGIC DEBUG END ===");
      throw error;
    }
  }
 
  // ---------------------
  // 🌐 REQUEST METHODS
  // ---------------------
 
  // Regular GET method
  async get(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: {
          ...this.getGetHeaders(),
          ...options.headers,
        },
        credentials: "include",
        mode: "cors",
        ...options,
      });
      return this.handleResponse(response);
    } catch (error) {
      if (this.debugMode) {
        console.error(`❌ GET request failed for ${endpoint}:`, error.message);
      }
      throw error;
    }
  }
 
  // Safe GET with CSRF retry logic
  async safeGet(endpoint, options = {}, csrfEndpoint = null) {
    const requestFn = async () => {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: {
          ...this.getGetHeaders(),
          ...options.headers,
        },
        credentials: "include",
        mode: "cors",
        ...options,
      });
      return this.handleResponse(response);
    };
 
    try {
      return await requestFn();
    } catch (error) {
      // If GET fails with CSRF error, retry with CSRF token
      const is403Error =
        error.message.includes("403") || error.message.includes("Forbidden");
      const isCSRFError =
        error.message.includes("CSRF") || error.message.includes("419");
 
      if (is403Error || isCSRFError) {
        if (this.debugMode) {
          console.log("🔄 GET request failed with CSRF error, retrying with CSRF token...");
        }
 
        const csrfEp = csrfEndpoint || endpoint;
        this.csrfTokens[csrfEp] = null;
 
        try {
          await this.fetchCSRFTokenFor(csrfEp);
          const headers = await this.getModifyingHeaders(csrfEp);
 
          const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: "GET",
            headers: {
              ...headers,
              ...options.headers,
            },
            credentials: "include",
            mode: "cors",
            ...options,
          });
          return this.handleResponse(response);
        } catch (retryError) {
          console.error(`❌ GET retry failed for ${endpoint}:`, retryError.message);
          throw retryError;
        }
      }
 
      throw error;
    }
  }
 
  async post(endpoint, data = {}, options = {}, csrfEndpoint = null) {
    console.log("🔍 === POST REQUEST DEBUG START ===");
    console.log(`📤 POST to ${this.baseURL}${endpoint}`);
    console.log("📦 Request Data:", JSON.stringify(data, null, 2));
 
    const requestFn = async () => {
      const headers = await this.getModifyingHeaders(csrfEndpoint || endpoint);
 
      const requestConfig = {
        method: "POST",
        headers: { ...headers, ...options.headers },
        body: JSON.stringify(data),
        credentials: "include",
        mode: "cors",
        ...options,
      };
 
      console.log("📤 Final POST request config:", {
        url: `${this.baseURL}${endpoint}`,
        method: requestConfig.method,
        headers: requestConfig.headers,
        body: requestConfig.body,
        credentials: requestConfig.credentials,
        mode: requestConfig.mode
      });
 
      const response = await fetch(`${this.baseURL}${endpoint}`, requestConfig);
 
      console.log("📡 POST Response received:");
      console.log("  Status:", response.status, response.statusText);
      console.log("  OK:", response.ok);
      console.log("  Type:", response.type);
 
      console.log("🔍 === POST REQUEST DEBUG END ===");
      return this.handleResponse(response);
    };
 
    return this.retryWithNewCSRF(requestFn, csrfEndpoint || endpoint);
  }
 
  async safePost(endpoint, data = {}, options = {}, csrfEndpoint = null) {
    return this.post(endpoint, data, options, csrfEndpoint);
  }
 
  async put(endpoint, data = {}, options = {}, csrfEndpoint = null) {
    const requestFn = async () => {
      const headers = await this.getModifyingHeaders(csrfEndpoint || endpoint);
 
      if (this.debugMode) {
        console.log(`📤 PUT to ${this.baseURL}${endpoint}`);
        console.log("📋 Headers:", headers);
      }
 
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PUT",
        headers: { ...headers, ...options.headers },
        body: JSON.stringify(data),
        credentials: "include",
        mode: "cors",
        ...options,
      });
      return this.handleResponse(response);
    };
 
    return this.retryWithNewCSRF(requestFn, csrfEndpoint || endpoint);
  }
 
  async safePut(endpoint, data = {}, options = {}, csrfEndpoint = null) {
    return this.put(endpoint, data, options, csrfEndpoint);
  }
 
  async patch(endpoint, data = {}, options = {}, csrfEndpoint = null) {
    const requestFn = async () => {
      const headers = await this.getModifyingHeaders(csrfEndpoint || endpoint);
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "PATCH",
        headers: { ...headers, ...options.headers },
        body: JSON.stringify(data),
        credentials: "include",
        mode: "cors",
        ...options,
      });
      return this.handleResponse(response);
    };
 
    return this.retryWithNewCSRF(requestFn, csrfEndpoint || endpoint);
  }
 
  async safePatch(endpoint, data = {}, options = {}, csrfEndpoint = null) {
    return this.patch(endpoint, data, options, csrfEndpoint);
  }
 
  async delete(endpoint, options = {}, csrfEndpoint = null) {
    const requestFn = async () => {
      const headers = await this.getModifyingHeaders(csrfEndpoint || endpoint);
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "DELETE",
        headers: { ...headers, ...options.headers },
        credentials: "include",
        mode: "cors",
        ...options,
      });
      return this.handleResponse(response);
    };
 
    return this.retryWithNewCSRF(requestFn, csrfEndpoint || endpoint);
  }
 
  async safeDelete(endpoint, options = {}, csrfEndpoint = null) {
    return this.delete(endpoint, options, csrfEndpoint);
  }
 
  // ---------------------
  // 🔧 Helpers
  // ---------------------
 
  clearCSRFTokens() {
    this.csrfTokens = {};
    if (this.debugMode) {
      console.log("🗑️ All CSRF tokens cleared");
    }
  }
 
  getBaseURL() {
    return this.baseURL;
  }
 
  toggleDebug(enabled = true) {
    this.debugMode = enabled;
    console.log(`🐛 Debug mode: ${enabled ? 'ON' : 'OFF'}`);
  }
}
 
// Export singleton
const apiAuth = new ApiAuth();
export default apiAuth;