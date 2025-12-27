
export async function POST(request: Request): Promise<Response> {
  const headers = Object.fromEntries(request.headers.entries());
  const rawBody = await request.text();

  let parsedBody: unknown = rawBody;
  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : rawBody;
  } catch {
    // keep raw text if not JSON
  }

  console.log("[line-message] incoming request", {
    method: request.method,
    headers,
    body: parsedBody,
  });

  return new Response("OK", { status: 200 });
}
