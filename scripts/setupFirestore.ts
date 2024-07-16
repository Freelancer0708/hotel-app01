import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// サービスアカウントキーを読み込む
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
      { name: '2000円プラン', price: 2000, description: '基本プラン', availability: { '2024-07-01': 10, '2024-07-02': 8 } },
      { name: '4000円プラン', price: 4000, description: '標準プラン', availability: { '2024-07-01': 5, '2024-07-02': 3 } },
      { name: '10000円プラン', price: 10000, description: '豪華プラン', availability: { '2024-07-01': 2, '2024-07-02': 1 } }
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
        description: plan.description
      });

      console.log('Added plan:', {
        id: planRef.id,
        name: plan.name,
        price: plan.price,
        description: plan.description
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
