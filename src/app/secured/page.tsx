import Link from "next/link";
import { resetGmailApiKey } from "@/actions/secure";

export default async function Page() {
    return (
        <section>
            <p>SECURE Route</p>
            <Link href={resetGmailApiKey}>Reset Gmail API Key</Link>
        </section>
    );
}