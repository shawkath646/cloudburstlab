"use server";
import { cache } from "react";
import { db } from "@/lib/firebase";
import { MetadataType } from "@/types";
import { timestampToDate } from "@/utils/timestampToDate";

const getAppData = cache(async () => {
    const appDoc = await db.collection("metadata").doc("appdata").get();
    const appData = appDoc.data() as MetadataType;
    appData.lastUpdatedOn = timestampToDate(appData.lastUpdatedOn);
    appData.publishedOn = timestampToDate(appData.publishedOn);
    return appData;
});

export {
    getAppData
};
