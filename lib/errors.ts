/**
 * Raised when the incoming OpenAPI payload cannot be parsed or does not match
 * the expected shape. We surface this to API routes to return 400 responses
 * instead of generic 500s.
 */
export class InvalidSpecError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSpecError";
  }
}
