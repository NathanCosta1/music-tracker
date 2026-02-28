import Link from 'next/link'

export default async function Home() {


  return (
    <ul> Home Page
      <li>
        <Link href="/search">Search</Link>
      </li>
      <li>
        <Link href="/feed">Feed</Link>
      </li>
    </ul>
  );
}