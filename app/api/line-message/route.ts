
export async function POST(request: Request): Promise<Response> {
  const headers = Object.fromEntries(request.headers.entries());
  const rawBody = await request.text();

  console.log("[line-message] incoming request", {
    method: request.method,
    headers,
    body: rawBody,
  });

  return new Response("OK", { status: 200 });
}
