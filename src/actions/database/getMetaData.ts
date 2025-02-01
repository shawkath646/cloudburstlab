"use server";
import { cache } from "react";
import { db } from "@/config/firebase.config";
import { MetaDataType } from "@/types/types";
import { timestampToDate } from "@/utilities/date&times";

const getAppData = cache(async () => {
    const appDoc = await db.collection("metadata").doc("appdata").get();
    const appData = appDoc.data() as MetaDataType;
    appData.lastUpdatedOn = timestampToDate(appData.lastUpdatedOn);
    appData.publishedOn = timestampToDate(appData.publishedOn);
    return appData;
});

export {
    getAppData
};
