import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/actions/auth";
import { oAuth2Client } from "@/actions/secure";
import { db } from "@/config/firebase.config";

export async function GET(request: NextRequest) {
  // Authorization check (uncomment if needed)
  // const session = await getSession();
  // if (session?.id !== process.env.DEVELOPER_ID) {
  //   return NextResponse.json({ status: false, error: "User is not authorized for this action" }, { status: 401 });
  // }

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
