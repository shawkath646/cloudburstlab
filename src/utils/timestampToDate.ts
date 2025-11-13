export type FirebaseTimestamp =
  | { toDate: () => Date }
  | { seconds: number; nanoseconds?: number };

export function timestampToDate(ts: FirebaseTimestamp | Date): Date {
  if (ts instanceof Date) {
    return ts;
  }

  if ("toDate" in ts && typeof ts.toDate === "function") {
    return ts.toDate();
  }

  const { seconds, nanoseconds = 0 } = ts as { seconds: number; nanoseconds?: number };
  const ms = seconds * 1000 + Math.floor(nanoseconds / 1e6);

  return new Date(ms);
}


export default timestampToDate;