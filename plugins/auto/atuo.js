// Command-only restrictions are applied by commandPolicyMiddleware.
// Returning true here would stop every later before hook, including moderation.
export default async function before() {
  return false;
}
