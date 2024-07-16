import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, addDoc, collection, Timestamp, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { useAuthContext } from '../../../../contexts/AuthContext';
import withAuth from '../../../../hoc/withAuth';

type Plan = {
  id: string;
  name: string;
  price: number;
  description: string;
};

const PlanPage = () => {
  const router = useRouter();
  const { hotelId, planId } = router.query;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [availability, setAvailability] = useState<{ [date: string]: number }>({});
  const [message, setMessage] = useState<string | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    if (hotelId && planId) {
      const fetchPlan = async () => {
        const planDoc = await getDoc(doc(db, 'hotels', hotelId as string, 'plans', planId as string));
        if (planDoc.exists()) {
          setPlan({ id: planDoc.id, ...planDoc.data() } as Plan);
        }

        const availabilitySnapshot = await getDocs(collection(db, 'hotels', hotelId as string, 'plans', planId as string, 'availability'));
        const availabilityData: { [date: string]: number } = {};
        availabilitySnapshot.forEach(doc => {
          availabilityData[doc.id] = doc.data().rooms;
        });
        setAvailability(availabilityData);
      };

      fetchPlan();
    }
  }, [hotelId, planId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkInDate || !checkOutDate || !user) {
      setMessage('Please fill in all fields.');
      return;
    }

    const checkInRooms = availability[checkInDate];
    const checkOutRooms = availability[checkOutDate];

    if (!checkInRooms || checkInRooms <= 0 || !checkOutRooms || checkOutRooms <= 0) {
      setMessage('Selected dates are fully booked.');
      return;
    }

    try {
      await addDoc(collection(db, 'reservations'), {
        hotelId,
        planId,
        userId: user.uid,
        checkInDate: Timestamp.fromDate(new Date(checkInDate)),
        checkOutDate: Timestamp.fromDate(new Date(checkOutDate)),
        status: 'Pending',
      });

      // Update the availability
      const checkInRef = doc(db, 'hotels', hotelId as string, 'plans', planId as string, 'availability', checkInDate);
      const checkOutRef = doc(db, 'hotels', hotelId as string, 'plans', planId as string, 'availability', checkOutDate);
      await updateDoc(checkInRef, { rooms: checkInRooms - 1 });
      await updateDoc(checkOutRef, { rooms: checkOutRooms - 1 });

      setMessage('Reservation successful!');
    } catch (error) {
      console.error('Error making reservation: ', error);
      setMessage('Failed to make reservation.');
    }
  };

  if (!plan) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{plan.name}</h1>
      <p>{plan.description}</p>
      <p>Price: ¥{plan.price}</p>
      <form onSubmit={handleSubmit}>
        <label>
          Check-in Date:
          <input type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} required />
        </label>
        <label>
          Check-out Date:
          <input type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} required />
        </label>
        <button type="submit">Reserve</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default withAuth(PlanPage);
