export function logServerError(scope: string, error: unknown, extra?: Record<string, unknown>) {
  const serializedMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);

  console.error(`[${scope}]`, {
    message: serializedMessage,
    ...extra,
  });
}

