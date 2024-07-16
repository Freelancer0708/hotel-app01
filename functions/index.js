// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

exports.sendReservationEmail = functions.firestore
  .document('reservations/{reservationId}')
  .onCreate(async (snap, context) => {
    const reservation = snap.data();
    const userDoc = await admin.firestore().doc(`users/${reservation.userId}`).get();
    const userEmail = userDoc.data().email;

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: userEmail,
      subject: 'Reservation Confirmation',
      text: `Your reservation is confirmed. Check-in Date: ${reservation.checkInDate.toDate().toLocaleDateString()}, Check-out Date: ${reservation.checkOutDate.toDate().toLocaleDateString()}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Reservation email sent to:', userEmail);
    } catch (error) {
      console.error('Error sending reservation email:', error);
    }
  });
