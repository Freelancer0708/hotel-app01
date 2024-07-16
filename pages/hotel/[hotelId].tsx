import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import Link from 'next/link';
import withAuth from '../../hoc/withAuth';

type Hotel = {
  id: string;
  name: string;
  location: string;
  description: string;
};

type Plan = {
  id: string;
  name: string;
  price: number;
  description: string;
};

const HotelPage = () => {
  const router = useRouter();
  const { hotelId } = router.query;
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    if (hotelId) {
      const fetchHotel = async () => {
        const hotelDoc = await getDoc(doc(db, 'hotels', hotelId as string));
        if (hotelDoc.exists()) {
          setHotel({ id: hotelDoc.id, ...hotelDoc.data() } as Hotel);
        }
      };

      const fetchPlans = async () => {
        const plansCollection = collection(db, 'hotels', hotelId as string, 'plans');
        const plansSnapshot = await getDocs(plansCollection);
        const plansData = plansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Plan[];
        setPlans(plansData);
      };

      fetchHotel();
      fetchPlans();
    }
  }, [hotelId]);

  if (!hotel) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{hotel.name}</h1>
      <p>{hotel.location}</p>
      <p>{hotel.description}</p>
      <h2>Plans</h2>
      <ul>
        {plans.map(plan => (
          <li key={plan.id}>
            <Link href={`/hotel/${hotelId}/plan/${plan.id}`}>
              {plan.name} - ¥{plan.price}
            </Link>
            <p>{plan.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default withAuth(HotelPage);
