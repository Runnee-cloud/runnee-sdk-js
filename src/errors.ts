/** Errors never retain request headers, request bodies or raw response bodies. */
export class RunneeError extends Error {
  readonly status?: number;
  readonly requestId?: string;
  readonly code?: string;
  constructor(
    message: string,
    details: { status?: number; requestId?: string; code?: string } = {},
  ) {
    super(message);
    this.name = new.target.name;
    Object.assign(this, details);
  }
}
export class RunneeAuthenticationError extends RunneeError {}
export class RunneePermissionError extends RunneeError {}
export class RunneeValidationError extends RunneeError {}
export class RunneeRateLimitError extends RunneeError {
  retryAfter?: number;
}
export class RunneeTimeoutError extends RunneeError {}
export class RunneeNetworkError extends RunneeError {}
export class RunneeServerError extends RunneeError {}
export class RunneeConflictError extends RunneeError {}
export class RunneeNotFoundError extends RunneeError {}
export class RunneeResponseError extends RunneeError {}
export class RunneeCancelledError extends RunneeError {}
