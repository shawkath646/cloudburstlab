"use server";
import { notFound } from "next/navigation";
import { cache } from "react";
import { db } from "@/config/firebase.config";
import { ClientAppDataType } from "@/types/types";
import { timestampToDate } from "@/utilities/date&times";

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