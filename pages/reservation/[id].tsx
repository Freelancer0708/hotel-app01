import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import withAuth from '../../hoc/withAuth';

type Reservation = {
  id: string;
  hotelId: string;
  planId: string;
  userId: string;
  checkInDate: Timestamp;
  checkOutDate: Timestamp;
  status: string;
};

const ReservationPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [reservation, setReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    if (id) {
      const fetchReservation = async () => {
        const reservationDoc = await getDoc(doc(db, 'reservations', id as string));
        if (reservationDoc.exists()) {
          setReservation({ id: reservationDoc.id, ...reservationDoc.data() } as Reservation);
        }
      };

      fetchReservation();
    }
  }, [id]);

  if (!reservation) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Reservation Complete</h1>
      <p>Reservation ID: {reservation.id}</p>
      <p>Check-in Date: {reservation.checkInDate.toDate().toLocaleDateString()}</p>
      <p>Check-out Date: {reservation.checkOutDate.toDate().toLocaleDateString()}</p>
      <p>Status: {reservation.status}</p>
    </div>
  );
};

export default withAuth(ReservationPage);
