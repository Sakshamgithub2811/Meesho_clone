import dotenv from 'dotenv';
dotenv.config();

import admin, { auth } from '../src/config/firebaseAdmin.js';
import { sendVerificationEmail } from '../src/utils/emailTemplates.js';

console.log('Testing admin.auth...');
console.log('auth object:', auth ? 'Found' : 'Null');

async function test() {
  try {
    const testEmail = 'shrutipaliwal61+test4@gmail.com';
    console.log('Testing generateEmailVerificationLink for:', testEmail);
    const link = await admin.auth().generateEmailVerificationLink(testEmail);
    console.log('Generated verification link successfully:', link);
    
    console.log('Testing sending email with nodemailer...');
    const res = await sendVerificationEmail({
      email: testEmail,
      name: 'Shruti Paliwal',
      verificationLink: link
    });
    console.log('Email send result:', res);
  } catch (err) {
    console.error('Error during test:', err);
  }
}

test();

