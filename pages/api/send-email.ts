import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

const sendEmail = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { to, details } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: '予約確認メール',
    html: `
      <p>予約ありがとうございます。</p>
      <p>プラン名: ${details.planName}</p>
      <p>ホテル名: ${details.hotelName}</p>
      <p>予約日: ${details.reservationDate}</p>
      <p>チェックイン日: ${details.checkInDate} ${details.checkInTime}</p>
      <p>チェックアウト日: ${details.checkOutDate} ${details.checkOutTime}</p>
      <p>金額: ¥${details.price}</p>
    `,
  };

  const adminMailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: '新しい予約が入りました',
    html: `
      <p>新しい予約が入りました。</p>
      <p>プラン名: ${details.planName}</p>
      <p>ホテル名: ${details.hotelName}</p>
      <p>予約日: ${details.reservationDate}</p>
      <p>チェックイン日: ${details.checkInDate} ${details.checkInTime}</p>
      <p>チェックアウト日: ${details.checkOutDate} ${details.checkOutTime}</p>
      <p>金額: ¥${details.price}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    await transporter.sendMail(adminMailOptions);
    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (err) {
    console.error('Error sending emails', err);
    res.status(500).json({ message: 'Error sending emails', error: err });
  }
};

export default sendEmail;
