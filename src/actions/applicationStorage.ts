"use server";

import { cache } from "react";
import { db } from "@/lib/firebase";

interface ApplicationData {
  author: string;
  createdOn: any;
  disabledMessage: string;
  icon: string;
  isEnabled: boolean;
  liveUrl: string;
  name: string;
  secret: string;
  sourceCode: string;
  appSecret?: string;
  status?: string;
}

export const getApplicationById = cache(async (appId: string): Promise<ApplicationData | null> => {
  try {
    const appDoc = await db.collection('applications').doc(appId).get();
    
    if (!appDoc.exists) {
      return null;
    }

    return appDoc.data() as ApplicationData;
  } catch (error) {
    console.error('Error fetching application:', error);
    return null;
  }
});

export async function validateAppAuthentication(appId: string, appSecret: string): Promise<{ valid: boolean; error?: string; appData?: ApplicationData }> {
  try {
    const appData = await getApplicationById(appId);

    if (!appData) {
      return { valid: false, error: 'Invalid App ID' };
    }

    if (appData.appSecret !== appSecret && appData.secret !== appSecret) {
      return { valid: false, error: 'Invalid App Secret' };
    }

    if (appData.status === 'inactive' || appData.isEnabled === false) {
      return { valid: false, error: 'App is not active' };
    }

    return { valid: true, appData };
  } catch (error) {
    console.error('Error validating app authentication:', error);
    return { valid: false, error: 'Authentication failed' };
  }
}

export const getApplicationStorage = cache(async (appId: string, dataId: string) => {
  try {
    const storageDoc = await db
      .collection('applications')
      .doc(appId)
      .collection('storage')
      .doc(dataId)
      .get();
    
    if (!storageDoc.exists) {
      return null;
    }

    return storageDoc.data();
  } catch (error) {
    console.error('Error fetching application storage:', error);
    return null;
  }
});

export async function createApplicationStorage(appId: string, data: Record<string, any>): Promise<{ success: boolean; databaseId?: string; error?: string }> {
  try {
    const storageRef = db
      .collection('applications')
      .doc(appId)
      .collection('storage')
      .doc();

    const storageData = {
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };

    await storageRef.set(storageData);

    return {
      success: true,
      databaseId: storageRef.id
    };
  } catch (error) {
    console.error('Error creating application storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function updateApplicationStorage(appId: string, dataId: string, data: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  try {
    const storageRef = db
      .collection('applications')
      .doc(appId)
      .collection('storage')
      .doc(dataId);

    const updateData = {
      ...data,
      updatedAt: new Date()
    };

    await storageRef.update(updateData);

    return { success: true };
  } catch (error) {
    console.error('Error updating application storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function deleteApplicationStorage(appId: string, dataId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .collection('applications')
      .doc(appId)
      .collection('storage')
      .doc(dataId)
      .delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting application storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
