import { NextRequest, NextResponse } from "next/server";
import { getAppData } from "@/actions/database/getMetadata";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const variant = searchParams.get('variant') ?? 'transparent';
    
    const brandingData = await getAppData();
    
    const iconUrl = brandingData.icon?.[variant as keyof typeof brandingData.icon] || brandingData.icon?.transparent;
    
    if (!iconUrl) {
        return NextResponse.json(
            { error: 'Icon variant not found' },
            { status: 404 }
        );
    }
    
    return NextResponse.redirect(iconUrl, { status: 307 });
}