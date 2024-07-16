import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, addDoc, collection, Timestamp, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../../firebase';
import { useAuthContext } from '../../../../contexts/AuthContext';
import withAuth from '../../../../hoc/withAuth';
import Calendar from '../../../../components/Calendar';
import { addDays, format } from 'date-fns';

type Plan = {
  id: string;
  name: string;
  price: number;
  description: string;
  duration: number; // 宿泊日数
  checkInTime: string;
  checkOutTime: string;
};

const PlanPage = () => {
  const router = useRouter();
  const { hotelId, planId } = router.query;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [availability, setAvailability] = useState<{ [date: string]: { rooms: number, booked: number } }>({});
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
        const availabilityData: { [date: string]: { rooms: number, booked: number } } = {};
        availabilitySnapshot.forEach(doc => {
          const data = doc.data();
          availabilityData[doc.id] = { rooms: data.rooms, booked: data.booked || 0 };
        });
        setAvailability(availabilityData);
      };

      fetchPlan();
    }
  }, [hotelId, planId]);

  const handleDateClick = (date: Date) => {
    setCheckInDate(date);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkInDate || !user) {
      setMessage('Please select a valid check-in date.');
      return;
    }

    const checkInDateString = format(checkInDate, 'yyyy_MM_dd');
    const checkOutDate = addDays(checkInDate, plan!.duration - 1); // duration 日泊まるため、実質的なチェックアウト日は duration - 1 日後
    const checkOutDateString = format(checkOutDate, 'yyyy_MM_dd');
    const checkInRooms = availability[checkInDateString];
    const checkOutRooms = availability[checkOutDateString];

    if (!checkInRooms || (checkInRooms.rooms - checkInRooms.booked) <= 0 || !checkOutRooms || (checkOutRooms.rooms - checkOutRooms.booked) <= 0) {
      setMessage('Selected dates are fully booked.');
      return;
    }

    try {
      const reservationRef = await addDoc(collection(db, 'reservations'), {
        hotelId,
        planId,
        userId: user.uid,
        checkInDate: Timestamp.fromDate(checkInDate),
        checkOutDate: Timestamp.fromDate(checkOutDate),
        status: 'Pending',
        planName: plan!.name,
        hotelName: plan!.name, // Adjust if you have a separate hotel name
        reservationDate: Timestamp.now(),
        checkInTime: plan!.checkInTime,
        checkOutTime: plan!.checkOutTime,
        price: plan!.price,
        email: user.email,
      });

      // Update the availability
      const checkInRef = doc(db, 'hotels', hotelId as string, 'plans', planId as string, 'availability', checkInDateString);
      const checkOutRef = doc(db, 'hotels', hotelId as string, 'plans', planId as string, 'availability', checkOutDateString);
      await updateDoc(checkInRef, { booked: checkInRooms.booked + 1 });
      await updateDoc(checkOutRef, { booked: checkOutRooms.booked + 1 });

      // Send reservation confirmation email
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user.email,
          details: {
            planName: plan!.name,
            hotelName: plan!.name, // Adjust if you have a separate hotel name
            reservationDate: format(new Date(), 'yyyy/MM/dd HH:mm:ss'),
            checkInDate: format(checkInDate, 'yyyy/MM/dd'),
            checkInTime: plan!.checkInTime,
            checkOutDate: format(checkOutDate, 'yyyy/MM/dd'),
            checkOutTime: plan!.checkOutTime,
            price: plan!.price,
          },
        }),
      });

      if (response.ok) {
        // Navigate to confirmation page
        router.push(`/reservation/${reservationRef.id}`);
      } else {
        setMessage('Failed to send confirmation email.');
      }
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
      <p>Check-in Time: {plan.checkInTime}</p>
      <p>Check-out Time: {plan.checkOutTime}</p>
      <form onSubmit={handleSubmit}>
        <Calendar
          availability={availability}
          onDateClick={handleDateClick}
          selectedDate={checkInDate}
        />
        <button type="submit">Reserve</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default withAuth(PlanPage);
