"use server";
import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { db } from "./firebase.config";

interface GmailApiTokensType {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
};

export default async function sendMail(mailOptions: MailOptions) {
  const tokensDoc = await db.collection("metadata").doc("gmail-api-tokens").get();
  const tokens = tokensDoc.data() as GmailApiTokensType;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: true,
    from: process.env.NODE_MAILER_ID,
    auth: {
      type: 'OAuth2',
      user: process.env.NODE_MAILER_ID,
      clientId: process.env.GMAIL_API_ID,
      clientSecret: process.env.GMAIL_API_SECRET,
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token
    },
  });

  return await transporter.sendMail(mailOptions);
};
