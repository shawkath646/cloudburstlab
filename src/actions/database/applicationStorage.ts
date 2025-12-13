import { cache } from "react";
import { db } from "@/lib/firebase";
import convertStringsToDates from "@/utils/convertStringsToDates";

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

export const getApplicationStorage = cache(async (appId: string, dataId: string, subCollection?: string |  null) => {
  try {
    const docRef = db
      .collection('applications')
      .doc(appId)
      .collection('storage')
      .doc(dataId);

    if (subCollection) {
      const snapshot = await docRef.collection(subCollection).get();
      return snapshot.docs.map(doc => doc.data());
    }

    const storageDoc = await docRef.get();
    
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
    const processedData = convertStringsToDates(data);

    const batch = db.batch();
    let mainData = { ...processedData };
    let subcollections: { key: string, items: any[] }[] = [];

    if (Array.isArray(processedData.collection)) {
      for (const col of processedData.collection) {
        if (col?.name && Array.isArray(col.data)) {
          subcollections.push({ key: col.name, items: col.data });
        }
      }
      delete mainData.collection;
    }

    let docId = mainData.id ? String(mainData.id) : undefined;
    if (docId) delete mainData.id;

    const storageRef = docId
      ? db.collection('applications').doc(appId).collection('storage').doc(docId)
      : db.collection('applications').doc(appId).collection('storage').doc();

    if (docId) {
      const existingDoc = await storageRef.get();
      if (existingDoc.exists) {
        return {
          success: false,
          error: `Document with ID '${docId}' already exists.`
        };
      }
    }

    const storageData = {
      createdAt: new Date(),
      updatedAt: new Date(),
      ...mainData
    };

    batch.set(storageRef, storageData);

    for (const sub of subcollections) {
      const subColRef = storageRef.collection(sub.key);
      for (const item of sub.items) {
        const newItemRef = subColRef.doc(); 
        batch.set(newItemRef, item);
      }
    }

    await batch.commit();

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
    const storageRef = db.collection('applications').doc(appId).collection('storage').doc(dataId);
    const batch = db.batch();

    let mainData = { ...data };
    let subcollections: { key: string, items: any[] }[] = [];
    
    if (Array.isArray(data.collection)) {
      for (const col of data.collection) {
        if (col?.name && Array.isArray(col.data)) {
          subcollections.push({ key: col.name, items: col.data });
        }
      }
      delete mainData.collection;
    }

    const updateData = { ...mainData, updatedAt: new Date() };
    batch.update(storageRef, updateData);

    for (const sub of subcollections) {
      const subColRef = storageRef.collection(sub.key);
      const existing = await subColRef.get();
      
      existing.docs.forEach(doc => batch.delete(doc.ref));
      
      for (const item of sub.items) {
        const newItemRef = subColRef.doc();
        batch.set(newItemRef, item);
      }
    }

    await batch.commit();

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
    const storageRef = db.collection('applications').doc(appId).collection('storage').doc(dataId);
    
    const subCollections = await storageRef.listCollections();
    
    for (const collection of subCollections) {
        const snapshot = await collection.get();
        if (!snapshot.empty) {
          const batch = db.batch();
          snapshot.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
        }
    }

    await storageRef.delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting application storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}