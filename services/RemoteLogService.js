// 🌐 Remote Logging Service for debugging iOS crashes without USB
import { Platform } from 'react-native';

class RemoteLogService {
  constructor() {
    this.logQueue = [];
    this.isEnabled = true; // ENABLED for production debugging
    this.remoteEndpoint = 'https://webhook.site/0c8c4a7e-33bb-4ea7-a5b6-0129f69d57a0'; // Free webhook for testing
    this.maxQueueSize = 50;
    this.batchSize = 10;
    this.flushInterval = 30000; // 30 seconds
    
    // Auto-flush logs periodically
    if (this.isEnabled) {
      setInterval(() => {
        this.flushLogs();
      }, this.flushInterval);
    }
  }

  // Add a log to the queue
  addLog(level, message, metadata = {}) {
    if (!this.isEnabled) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      platform: Platform.OS,
      metadata: {
        ...metadata,
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        }
      }
    };

    this.logQueue.push(logEntry);
    
    // Keep queue size manageable
    if (this.logQueue.length > this.maxQueueSize) {
      this.logQueue = this.logQueue.slice(-this.maxQueueSize);
    }
    
    // Auto-flush if queue is getting full
    if (this.logQueue.length >= this.batchSize) {
      this.flushLogs();
    }
  }

  // Send logs to remote server
  async flushLogs() {
    if (!this.isEnabled || this.logQueue.length === 0) return;
    
    const logsToSend = this.logQueue.splice(0, this.batchSize);
    
    try {
      const response = await fetch(this.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logs: logsToSend,
          appVersion: '1.0.0', // Replace with actual version
          sessionId: Date.now(), // Simple session tracking
        }),
        timeout: 10000, // 10 second timeout
      });
      
      if (!response.ok) {
        console.warn('[REMOTE LOG] Failed to send logs:', response.status);
        // Put logs back in queue if failed
        this.logQueue.unshift(...logsToSend);
      } else {
        console.log('[REMOTE LOG] Successfully sent', logsToSend.length, 'logs');
      }
    } catch (error) {
      console.warn('[REMOTE LOG] Error sending logs:', error.message);
      // Put logs back in queue if failed
      this.logQueue.unshift(...logsToSend);
    }
  }

  // Enable/disable remote logging
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log('[REMOTE LOG] Remote logging', enabled ? 'ENABLED' : 'DISABLED');
  }

  // Set custom endpoint
  setEndpoint(endpoint) {
    this.remoteEndpoint = endpoint;
    console.log('[REMOTE LOG] Endpoint set to:', endpoint);
  }

  // Log critical errors that should always be sent
  logCritical(message, error = null) {
    const metadata = {
      isCritical: true,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : null
    };
    
    this.addLog('CRITICAL', message, metadata);
    
    // Force immediate flush for critical errors
    setTimeout(() => this.flushLogs(), 1000);
  }

  // Log app lifecycle events
  logLifecycle(event, data = {}) {
    this.addLog('LIFECYCLE', event, { lifecycleData: data });
  }

  // Log performance metrics
  logPerformance(metric, value, unit = 'ms') {
    this.addLog('PERFORMANCE', `${metric}: ${value}${unit}`, { 
      performanceMetric: { metric, value, unit }
    });
  }
}

// Export singleton instance
export const remoteLogger = new RemoteLogService();

// Helper functions for easy usage
export const logRemote = {
  info: (message, metadata) => remoteLogger.addLog('INFO', message, metadata),
  warn: (message, metadata) => remoteLogger.addLog('WARN', message, metadata),
  error: (message, metadata) => remoteLogger.addLog('ERROR', message, metadata),
  critical: (message, error) => remoteLogger.logCritical(message, error),
  lifecycle: (event, data) => remoteLogger.logLifecycle(event, data),
  performance: (metric, value, unit) => remoteLogger.logPerformance(metric, value, unit),
};

// Instructions for setting up endpoints:
/*
🔧 SETUP INSTRUCTIONS:

1. Simple Webhook (Zapier/IFTTT):
   - Create a Zapier webhook that saves to Google Sheets
   - Set remoteLogger.setEndpoint('https://hooks.zapier.com/hooks/catch/...')

2. Firebase Functions:
   - Create a cloud function to receive logs
   - Store in Firestore for later analysis

3. Simple Node.js Server:
   - POST /log endpoint that saves to file or database
   - Can run on Heroku, Railway, or similar

4. Third-party Services:
   - LogRocket, Sentry, or similar services
   - They often have React Native SDKs

Example Server Endpoint (Node.js/Express):
app.post('/log', (req, res) => {
  const { logs, appVersion, sessionId } = req.body;
  console.log('Received logs:', logs.length);
  // Save to database/file
  res.json({ status: 'success' });
});
*/

export default remoteLogger; 