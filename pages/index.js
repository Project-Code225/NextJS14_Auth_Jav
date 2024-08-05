import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      try {
        const token = session?.user?.accessToken;
        if (token) {
          const decodedToken = jwtDecode(token);
          const expirationTime = decodedToken.exp * 1000 - Date.now();
          
          // Set a cookie with the session information
          Cookies.set('userSession', JSON.stringify({
            email: session.user.email,
            expiresAt: new Date(Date.now() + expirationTime).toISOString()
          }), { expires: expirationTime / (1000 * 60 * 60 * 24) }); // Convert milliseconds to days

          setLoading(false);
          
          if (expirationTime <= 0) {
            handleLogout();
          } else {
            const timer = setTimeout(() => {
              handleLogout();
            }, expirationTime);

            return () => clearTimeout(timer);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setLoading(false);
      }
    } else if (status === 'unauthenticated') {
      setLoading(false);
      // Clear the cookie when the user is not authenticated
      Cookies.remove('userSession');
    }
  }, [status, session]);

  const handleLogout = () => {
    // Clear the cookie when logging out
    Cookies.remove('userSession');
    signOut();
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {session ? (
        <>
          <h1>Welcome, {session.user.email}</h1>
          <button onClick={handleLogout}>Logout</button>
          <SessionInfo />
        </>
      ) : (
        <p>Please <Link href="/login"><a>login</a></Link>.</p>
      )}
    </div>
  );
}

// A new component to display session information
function SessionInfo() {
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const cookieData = Cookies.get('userSession');
    if (cookieData) {
      setSessionData(JSON.parse(cookieData));
    }
  }, []);

  if (!sessionData) return null;

  return (
    <div>
      <h2>Session Info:</h2>
      <p>Email: {sessionData.email}</p>
      <p>Expires at: {new Date(sessionData.expiresAt).toLocaleString()}</p>
    </div>
  );
}