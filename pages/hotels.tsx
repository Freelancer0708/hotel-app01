import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Link from 'next/link';
import withAuth from '../hoc/withAuth';

type Hotel = {
  id: string;
  name: string;
  location: string;
  description: string;
};

const HotelsPage = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    const fetchHotels = async () => {
      const hotelsCollection = collection(db, 'hotels');
      const hotelsSnapshot = await getDocs(hotelsCollection);
      const hotelsData = hotelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Hotel[];
      setHotels(hotelsData);
    };

    fetchHotels();
  }, []);

  return (
    <div>
      <h1>Hotels</h1>
      <ul>
        {hotels.map(hotel => (
          <li key={hotel.id}>
            <Link href={`/hotel/${hotel.id}`}>
              {hotel.name}
            </Link>
            <p>{hotel.location}</p>
            <p>{hotel.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default withAuth(HotelsPage);
