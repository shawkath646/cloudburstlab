import { firestore } from 'firebase-admin';

const timestampToDate = (input: firestore.Timestamp | Date): Date => {
    if (input instanceof Date) return input;
    const { seconds, nanoseconds } = input as firestore.Timestamp;
    return new Date(seconds * 1000 + nanoseconds / 1_000_000);
};

export {
    timestampToDate
};
