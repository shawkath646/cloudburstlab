import { google } from 'googleapis';

const { GMAIL_API_ID, GMAIL_API_SECRET, NEXT_PUBLIC_APP_BASE_URL } = process.env;

export const oAuth2Client = new google.auth.OAuth2(
    GMAIL_API_ID,
    GMAIL_API_SECRET,
    `${NEXT_PUBLIC_APP_BASE_URL}/api/internal/set-gmail-token`
);

export const resetGmailApiKey = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://mail.google.com/']
});
