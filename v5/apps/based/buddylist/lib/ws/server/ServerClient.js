import createWebSocketServerClient from './createWebSocketServerClient.js';

export default class ServerClient {
  constructor(bp, options = {}) {
    this.bp = bp;
    this.config = {
      host: "",
      api: "",
    };

    this.api = buddypond;

    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 999999; // Set to a high number for unlimited attempts
    this.maxBackoffDelay = 10000; // 10 seconds
    this.isIntentionallyClosed = false; // Flag to track intentional closure

    return this;
  }
}

ServerClient.prototype.connect = async function connectBuddyServerWs() {
  console.log("Connecting to BuddyServer WebSocket...");
  this.wsServerClient = await this.createWebSocketServerClient();
  console.log("Connected to BuddyServer WebSocket!");
  // TODO: needs to return / await the connection event
  // TODO: should emit buddylist::connected event ( not auth::qtokenid event )
  this.bp.emit('buddylist::connected', this.wsServerClient);
}

ServerClient.prototype.disconnect = async function disconnectBuddyServerWs() {
  console.log("Attempting disconnecting from BuddyServer WebSocket...");
  if (this.wsServerClient) {
    this.wsServerClient.closeConnection();
    this.wsServerClient = null;
    console.log("Disconnected from BuddyServer WebSocket");
  } else {
    console.log("No active WebSocket connection to disconnect");
  }
}

ServerClient.prototype.addBuddy = async function addBuddy(buddyname, cb) {
  console.log("NEW Calling addBuddy", this, buddyname);

  apiRequest('/buddylist/' + this.bp.me + '/add-buddy', 'POST', {
    buddyname: buddyname
  }, function (err, data) {
    cb(err, data);
  })
}

ServerClient.prototype.receivedInstantMessage = async function receivedInstantMessage(buddyName, cb) {
  console.log('ServerClient receivedInstantMessage', buddyName);
  this.wsServerClient.send(JSON.stringify({
    action: "receivedInstantMessage",
    buddyname: buddyName,
  }));
  cb(null);
}

ServerClient.prototype.setStatus = async function setStatus(buddyName, update, cb = function noop () {}) {
  // use wsServerClient to send the status update
  // console.log('calling setStatus', buddyName, update);
  this.wsServerClient.send(JSON.stringify({
    action: "setStatus",
    buddyname: buddyName,
    status: update.status,
    profilePicture: update.profilePicture
  }));
  cb(null);
};

ServerClient.prototype.createWebSocketServerClient = createWebSocketServerClient;

function apiRequest(uri, method, data, cb) {
  let url;

  url = buddypond.buddyServerApiEndpoint + uri;

  console.log("making apiRequest", url, method, data);

  let headers = {
    "Accept": "application/json",
    "Content-Type": "application/json; charset=utf-8",
    "X-Me": buddypond.me, // ✅ Include X-Me header for user identification
  };

  if (buddypond.qtokenid) {
    headers["Authorization"] = `Bearer ${buddypond.qtokenid}`; // ✅ Use Authorization header
  }

  let body = method === "POST" ? JSON.stringify(data) : undefined;

  // Prepare fetch options
  const options = {
    method: method,
    headers: headers,
    body: body,
    // credentials: "include",  // ✅ Allow CORS with cookies/auth headers
  };

  // Handling fetch timeout manually
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 sec timeout

  buddypond.incrementPackets("packetsSent");
  let perf = { start: new Date() };
  // console.log("apiRequest", url, options);
  fetch(url, { ...options, signal: controller.signal })
    .then(response => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        // Parse JSON for non-2xx responses
        return response.json().then(errorData => {
          // Create a custom error with status and JSON data
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.status = response.status;
          error.data = errorData; // Attach JSON payload
          throw error;
        });
      }
      return response.json();
    })
    .then(data => {
      buddypond.incrementPackets("packetsReceived");
      perf.end = new Date();
      buddypond.addPerfTime(perf);
      cb(null, data);
    })
    .catch(error => {
      let msg = "Fetch connection error. Retrying shortly.";
      if (error.name === "AbortError") {
        msg = "Fetch request timeout";
      } else if (error.message.includes("Payload Too Large")) {
        msg = "File upload was too large. Try a smaller file.";
      } else if (error.status === 400 && error.data) {
        // Use the JSON payload from the 400 error
        msg = error.data.error || error.data.message || "Invalid input. Please try again.";
      } else {
        msg = error.message;
      }
      console.error("❌ API Request Failed:", error);
      cb(new Error(msg), error.data || null);
    });
}

ServerClient.prototype.createWebSocketServerClient = createWebSocketServerClient;