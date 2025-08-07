import Link from 'next/link';

async function getPosts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/posts`, { cache: 'no-store' });
    if (!res.ok) {
      // Check for common issues like wrong URL or permalinks not set.
      if (res.status === 404) {
        throw new Error(`Error fetching posts: Not Found (404). Please check your NEXT_PUBLIC_WORDPRESS_URL and ensure permalinks are set to 'Post name' in WordPress.`);
      }
      throw new Error(`Error fetching posts: ${res.statusText}`);
    }
    const posts = await res.json();
    return posts;
  } catch (error) {
    console.error(error);
    // Return a special error object or re-throw to be caught by the component
    return { error: error.message };
  }
}

export default async function Home() {
  const posts = await getPosts();

  if ('error' in posts) {
    return (
      <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
        <h1>Error Loading Posts</h1>
        <p style={{ color: 'red' }}>Could not fetch posts from the WordPress site.</p>
        <p><strong>Details:</strong> {posts.error}</p>
        <hr />
        <h3>Troubleshooting Steps:</h3>
        <ul>
          <li>Verify that the <code>NEXT_PUBLIC_WORDPRESS_URL</code> in your <code>.env.local</code> file is correct and accessible.</li>
          <li>Ensure your WordPress site is running.</li>
          <li>In your WordPress admin dashboard, go to <strong>Settings &gt; Permalinks</strong> and make sure the structure is set to <strong>"Post name"</strong>.</li>
          <li>Check the browser console or terminal for more detailed network errors.</li>
        </ul>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>WordPress Posts</h1>
      <p>Click on a post to edit it with the Gutenberg editor.</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map((post: any) => (
          <li key={post.id} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '5px' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>
              <Link href={`/editor/${post.id}`} style={{ textDecoration: 'none', color: '#0070f3' }}>
                <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
              </Link>
            </h2>
            <p style={{ color: '#555' }}>Published on: {new Date(post.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
