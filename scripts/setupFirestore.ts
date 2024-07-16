import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// サービスアカウントキーをrequireで読み込む
const serviceAccount = require('./serviceAccountKey.json') as ServiceAccount;

// Firebase初期化
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

type Plan = {
  name: string;
  price: number;
  description: string;
  duration: number;
  checkInTime: string;
  checkOutTime: string;
  availability: { [date: string]: number };
};

type Hotel = {
  name: string;
  location: string;
  description: string;
  plans: Plan[];
};

const hotelsData: Hotel[] = [
  {
    name: '東京ホテル',
    location: '東京都',
    description: '東京の中心にあるホテルです。',
    plans: [
      { name: '2000円プラン', price: 2000, description: '基本プラン', duration: 2, checkInTime: '16:00', checkOutTime: '10:00', availability: { '2025_01_01': 10, '2025_01_02': 8 } },
      { name: '4000円プラン', price: 4000, description: '標準プラン', duration: 3, checkInTime: '16:00', checkOutTime: '10:00', availability: { '2025_01_01': 5, '2025_01_02': 3 } },
      { name: '10000円プラン', price: 10000, description: '豪華プラン', duration: 7, checkInTime: '16:00', checkOutTime: '10:00', availability: { '2025_01_01': 2, '2025_01_02': 1 } }
    ]
  },
  // 他のホテルのデータも同様に追加
  // ...
];

const setupFirestore = async () => {
  for (const hotel of hotelsData) {
    const hotelRef = db.collection('hotels').doc();

    await hotelRef.set({
      name: hotel.name,
      location: hotel.location,
      description: hotel.description
    });

    console.log('Added hotel:', {
      id: hotelRef.id,
      name: hotel.name,
      location: hotel.location,
      description: hotel.description
    });

    for (const plan of hotel.plans) {
      const planRef = hotelRef.collection('plans').doc();

      await planRef.set({
        name: plan.name,
        price: plan.price,
        description: plan.description,
        duration: plan.duration,
        checkInTime: plan.checkInTime,
        checkOutTime: plan.checkOutTime
      });

      console.log('Added plan:', {
        id: planRef.id,
        name: plan.name,
        price: plan.price,
        description: plan.description,
        duration: plan.duration,
        checkInTime: plan.checkInTime,
        checkOutTime: plan.checkOutTime
      });

      for (const [date, rooms] of Object.entries(plan.availability)) {
        const dateId = date.replace(/[^a-zA-Z0-9]/g, '_');
        const availabilityRef = planRef.collection('availability').doc(dateId);

        await availabilityRef.set({
          rooms: rooms
        });

        console.log('Added availability:', {
          date: dateId,
          rooms: rooms
        });
      }
    }
  }
};

setupFirestore().then(() => {
  console.log('Firestore setup complete.');
}).catch(error => {
  console.error('Error setting up Firestore:', error);
});
