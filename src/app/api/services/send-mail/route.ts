import { NextRequest, NextResponse } from "next/server";
import sendMail from "@/lib/nodemailer";
import mailAttachmentTypes from "@/constants/mailAttachmentTypes.json";

export async function POST(request: NextRequest) {
    const headers = request.headers;

    const authHeader = headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
            { success: false, message: "Authorization token missing or invalid." },
            { status: 401 }
        );
    }
    const token = authHeader.split(" ")[1];

    const receivedData = await request.json();

    if (!receivedData.subject || !receivedData.body || !receivedData.recipient) {
        return NextResponse.json(
            { success: false, message: "Incomplete data found!" },
            { status: 400 }
        );
    };

    const attachments = receivedData.attachments || [];
    if (attachments.length > 5) {
        return NextResponse.json(
            { success: false, message: "Too many attachments. Maximum allowed is 5." },
            { status: 400 }
        );
    };

    const validatedAttachments = attachments.map((attachment: any) => {
        if (!attachment.name || !attachment.type || !mailAttachmentTypes.includes(attachment.type) || !attachment.base64) {
            return NextResponse.json(
                { success: false, message: "Invalid attachment format." },
                { status: 500 }
            );
        }

        const base64Size = Buffer.from(attachment.base64, 'base64').length;
        if (base64Size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, message: `Attachment '${attachment.name}' exceeds 10MB limit.` },
                { status: 500 }
            );
        }

        return {
            filename: attachment.name,
            content: attachment.base64,
            contentType: attachment.type,
        };
    });

    try {
        await sendMail({
            to: receivedData.recipient,
            cc: receivedData.cc,
            bcc: receivedData.bcc,
            subject: receivedData.subject,
            html: receivedData.type === "html" ? receivedData.body : undefined,
            text: receivedData.type === "text" || !receivedData.type ? receivedData.body : undefined,
            attachments: validatedAttachments,
        });

        return NextResponse.json(
            { success: true, message: "Mail successfully sent to recipient." },
            { status: 200 }
        );
    } catch (error) {
        const errorMessage = error?.toString() || "An unknown error occurred.";
        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 500 }
        );
    }
};
