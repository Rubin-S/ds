// src/app/api/admin/submissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin from "@/firebase/firebaseAdmin"; // Ensure this path is correct
// import { verifyAdminAuth } from '@/lib/server/adminAuthUtils'; // Your server-side auth verification

export async function GET(req: NextRequest) {
  // --- Authentication & Authorization ---
  // const { uid, isAdmin, error, status } = await verifyAdminAuth(req);
  // if (!isAdmin) {
  //   return NextResponse.json({ message: error || "Unauthorized" }, { status: status || 401 });
  // }

  try {
    const db = admin.firestore();
    const snapshot = await db
      .collection("contactSubmissions")
      .orderBy("submittedAt", "desc")
      .get();

    if (snapshot.empty) {
      return NextResponse.json([]);
    }

    const submissions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json(submissions);
  } catch (err: any) {
    console.error(
      "[API GET /api/admin/submissions] Error fetching submissions:",
      err
    );
    return NextResponse.json(
      { message: "Failed to fetch submissions", detail: err.message },
      { status: 500 }
    );
  }
}
