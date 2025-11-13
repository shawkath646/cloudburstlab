"use server";
import { redirect } from "next/navigation";
import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import { db } from "./firebase";
import { oAuth2Client } from "@/actions/secure";

interface GmailApiConfigurationType {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

async function getValidAccessToken(): Promise<string> {
  const tokensDoc = await db.collection("metadata").doc("gmailAPIConfiguration").get();
  const tokens = tokensDoc.data() as GmailApiConfigurationType;

  if (!tokens || !tokens.refresh_token) {
    redirect(`${process.env.NEXT_PUBLIC_APP_BASE_URL}/secured?error=BlankToken`);
  }

  const isTokenExpired = !tokens.expiry_date || tokens.expiry_date < Date.now();

  if (!isTokenExpired) {
    return tokens.access_token;
  }

  oAuth2Client.setCredentials({ refresh_token: tokens.refresh_token });

  const { credentials } = await oAuth2Client.refreshAccessToken();
  await db.collection("metadata").doc("gmailAPIConfiguration").set(
    {
      access_token: credentials.access_token,
      expiry_date: credentials.expiry_date,
    },
    { merge: true }
  );

  return credentials.access_token as string;
}

export default async function sendMail(mailOptions: MailOptions) {
  const accessToken = await getValidAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.NODE_MAILER_ID,
      clientId: process.env.GMAIL_API_ID,
      clientSecret: process.env.GMAIL_API_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken,
    },
  });

  return await transporter.sendMail(mailOptions);
}
