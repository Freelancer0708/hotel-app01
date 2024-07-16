import { useEffect, useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Header = () => {
  const { user } = useAuthContext();
  const auth = getAuth();
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data()?.username || null);
        }
      }
    };
    fetchUsername();
  }, [user]);

  return (
    <header>
      <nav>
        <ul>
          <li><Link href="/">Home</Link></li>
          {user ? (
            <>
              <li><Link href="/tweet">Tweet</Link></li>
              <li><Link href="/profile">Profile</Link></li>
              <li><Link href="/hotels">Hotels</Link></li>
              <li className='header-right'>
                <div className=''>{username ? username : user.email}</div>
                <button onClick={() => auth.signOut()}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li><Link href="/login">Login</Link></li>
              <li><Link href="/register">Register</Link></li> {/* 追加 */}
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};
export default Header;