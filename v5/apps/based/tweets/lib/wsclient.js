export default class TweetsWebSocketClient {
  constructor({ endpoint, bp }) {
    this.endpoint = buddypond.tweetsWsEndpoint;
    this.bp = bp;

    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.maxBackoffDelay = 10000; // 10 seconds
    this.isIntentionallyClosed = false;
  }

  async connect() {
    const url = `${this.endpoint}?me=${buddypond.me}&qtokenid=${buddypond.qtokenid}`;
    console.log(`🔌 Connecting to Tweets...`);

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);

      const onOpen = () => {
        console.log('✅ WebSocket connected to Tweets');
        this.reconnectAttempts = 0;
        this.ws = ws;

        this.bp?.emit('tweets::connected');
        resolve(this);
      };

      const onMessage = (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch (err) {
          console.error('❌ Failed to parse message:', event.data);
          this.bp?.emit('tweets::error', { error: 'Invalid JSON', raw: event.data });
          return;
        }

        // 🔧 Add support for custom actions later
        console.log('📬 Message received from Tweets:', data);

        let action = data.action;
        let error = data.error;
        if (error) {
          console.error('❌ Error from Tweets:', error);
          this.bp?.emit('tweets::error', { error });
          return;
        }

        switch (action) {
            case 'tweetsFeed':
                console.log('Tweets feed received:', data.tweets);
                this.bp?.emit('tweets::feed', data.tweets);
                break;

                case 'removedTweet':
                  console.log('Tweet removed:', data.postId);
                  this.bp?.emit('tweets::removed', data.postId);
                  break;
        }

        // this.bp?.emit('tweets::message', { pondId: this.pondId, message: data });
      };

      const onClose = (event) => {
        console.warn(`⚠️ WebSocket closed [${event.code}]: ${event.reason}`);

        this.bp?.emit('tweets::disconnected', {
          pondId: this.pondId,
          code: event.code,
          reason: event.reason,
        });

        if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = Math.min(
            200 * Math.pow(2, this.reconnectAttempts) * (1 + 0.1 * Math.random()),
            this.maxBackoffDelay
          );
          console.log(`⏳ Reconnecting in ${Math.floor(delay)}ms...`);
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect().catch(() => {});
            this.bp?.emit('tweets::reconnecting', { attempt: this.reconnectAttempts });
          }, delay);
        } else {
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnect attempts reached. Giving up.');
            this.bp?.emit('tweets::reconnect_failed', { pondId: this.pondId });
          }
        }
      };

      const onError = (event) => {
        console.error('❌ WebSocket error:', event);
        this.bp?.emit('tweets::error', { error: 'WebSocket error', event });
        ws.close(1000, 'Error occurred');
        reject(new Error('WebSocket connection failed'));
      };

      // Attach handlers
      ws.addEventListener('open', onOpen);
      ws.addEventListener('message', onMessage);
      ws.addEventListener('close', onClose);
      ws.addEventListener('error', onError);

      // Store methods for teardown
      this._teardown = () => {
        ws.removeEventListener('open', onOpen);
        ws.removeEventListener('message', onMessage);
        ws.removeEventListener('close', onClose);
        ws.removeEventListener('error', onError);
      };
    });
  }

  disconnect() {
    if (this.ws) {
      this.isIntentionallyClosed = true;
      this._teardown?.();
      this.ws.close(1000, 'Normal closure');
      this.bp?.emit('tweets::closed', { pondId: this.pondId });
      this.ws = null;
      console.log('🛑 WebSocket disconnected from Tweets');
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const msg = typeof data === 'string' ? data : JSON.stringify(data);
      this.ws.send(msg);
    } else {
      console.warn('⚠️ Tried to send message but WebSocket is not open');
    }
  }


  async fetchTweets (context) {
    console.log('Requesting tweets feed from server...', context);
     // sends a listActivePonds action message to the server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({ action: 'fetchTweets', authorId: context });
    } else {
      console.warn('⚠️ Tried to get tweets feed but WebSocket is not open');
    }

  }

  async postTweet ({ content }) {
    console.log('Posting new tweet to server...');
     // sends a listActivePonds action message to the server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({ action: 'postTweet', content });
    } else {
      console.warn('⚠️ Tried to post tweet but WebSocket is not open');
    }
  }

  async likeTweet ({ tweetId }) {
    console.log('Liking tweet on server...');
     // sends a listActivePonds action message to the server
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({ action: 'likeTweet', tweetId });
    } else {
      console.warn('⚠️ Tried to like tweet but WebSocket is not open');
    }
  }

  async deleteTweet (tweetId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({ action: 'deleteTweet', tweetId });
    } else {
      console.warn('⚠️ Tried to delete tweet but WebSocket is not open');
    }
  }


}