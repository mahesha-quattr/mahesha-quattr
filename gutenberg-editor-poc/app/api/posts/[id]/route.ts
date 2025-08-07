import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { title, content } = await request.json();

  const username = process.env.WORDPRESS_API_USER;
  const password = process.env.WORDPRESS_API_PASSWORD;
  const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;

  if (!username || !password || !wordpressUrl) {
    return NextResponse.json(
      { message: 'WordPress API credentials are not set in .env.local' },
      { status: 500 }
    );
  }

  try {
    // 1. Get auth token
    const tokenRes = await fetch(`${wordpressUrl}/wp-json/jwt-auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!tokenRes.ok) {
        const errorBody = await tokenRes.json();
        console.error('Failed to get authentication token:', errorBody);
        return NextResponse.json(
            { message: 'Failed to get authentication token', details: errorBody },
            { status: tokenRes.status }
        );
    }

    const { token } = await tokenRes.json();

    // 2. Make the update request
    const updateRes = await fetch(`${wordpressUrl}/wp-json/wp/v2/posts/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        content,
      }),
    });

    if (!updateRes.ok) {
        const errorBody = await updateRes.json();
        console.error('Failed to update post:', errorBody);
        return NextResponse.json(
            { message: 'Failed to update post', details: errorBody },
            { status: updateRes.status }
        );
    }

    const data = await updateRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
