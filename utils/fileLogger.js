import * as FileSystem from 'expo-file-system';

class FileLogger {
  constructor() {
    this.logFile = `${FileSystem.documentDirectory}app-debug-log.txt`;
    this.initLog();
  }

  async initLog() {
    try {
      const timestamp = new Date().toISOString();
      await FileSystem.writeAsStringAsync(
        this.logFile,
        `=== APP START: ${timestamp} ===\n`,
        { append: false }
      );
    } catch (e) {
      console.error('FileLogger init failed:', e);
    }
  }

  async log(message) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] ${message}\n`;
      
      await FileSystem.writeAsStringAsync(
        this.logFile,
        logEntry,
        { append: true }
      );
    } catch (e) {
      console.error('FileLogger write failed:', e);
    }
  }

  async getLogs() {
    try {
      const logs = await FileSystem.readAsStringAsync(this.logFile);
      return logs;
    } catch (e) {
      return 'No logs found';
    }
  }

  async clearLogs() {
    try {
      await FileSystem.deleteAsync(this.logFile, { idempotent: true });
    } catch (e) {
      console.error('FileLogger clear failed:', e);
    }
  }
}

export const fileLogger = new FileLogger(); 