"use server";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/firebase";
import timestampToDate from "@/utils/timestampToDate";
import { ClientAppDataType } from "@/types";


const getClientAppData = cache(async (appId: string) => {
    const clientAppDoc = await db.collection("clientApps").doc(appId).get();
    if (!clientAppDoc.exists) return notFound();
    const clientAppData = clientAppDoc.data() as ClientAppDataType;
    clientAppData.createdOn = timestampToDate(clientAppData.createdOn);
    clientAppData.inactiveUntil = clientAppData.inactiveUntil ? timestampToDate(clientAppData.inactiveUntil) : null;
    return clientAppData;
});

export {
    getClientAppData
};