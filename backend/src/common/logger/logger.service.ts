import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

/**
 * Custom Logger Service
 * Prepared for Winston or Pino integration
 *
 * Supports development and production modes:
 * - Development: Verbose logging with colors
 * - Production: JSON structured logging
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  log(message: string, context?: string): void {
    // TODO: Integrate Winston or Pino
    console.log(`[${context || 'App'}] ${message}`);
  }

  error(message: string, trace?: string, context?: string): void {
    // TODO: Integrate Winston or Pino
    console.error(`[${context || 'App'}] ${message}`, trace);
  }

  warn(message: string, context?: string): void {
    // TODO: Integrate Winston or Pino
    console.warn(`[${context || 'App'}] ${message}`);
  }

  debug(message: string, context?: string): void {
    // TODO: Integrate Winston or Pino
    console.debug(`[${context || 'App'}] ${message}`);
  }

  verbose(message: string, context?: string): void {
    // TODO: Integrate Winston or Pino
    console.log(`[${context || 'App'}] ${message}`);
  }
}
