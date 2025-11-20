export class InvalidSpecError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSpecError";
  }
}
