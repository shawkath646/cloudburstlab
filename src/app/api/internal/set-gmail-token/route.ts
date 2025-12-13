import { NextRequest, NextResponse } from "next/server";
import { oAuth2Client } from "@/actions/secure";
import { db } from "@/lib/firebase";

export async function GET(request: NextRequest) {

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ status: false, error: "Authorization code not provided" }, { status: 400 });
  }

  const { tokens } = await oAuth2Client.getToken(code);

  if (!tokens || !tokens.access_token) {
    return NextResponse.json({ status: false, error: "Failed to retrieve tokens from authorization code" }, { status: 500 });
  }

  const docRef = db.collection("metadata").doc("gmailAPIConfiguration");
  const existingData = (await docRef.get()).data() || {};

  const updatedTokens = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || existingData.refresh_token,
    expiry_date: tokens.expiry_date || existingData.expiry_date,
  };

  await docRef.set(updatedTokens, { merge: true });
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_BASE_URL}/secured`);
};
