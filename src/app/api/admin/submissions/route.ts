// src/app/api/admin/submissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin from "@/firebase/firebaseAdmin";
// import { verifyAdminAuth } from '@/lib/server/adminAuthUtils'; // Your server-side auth verification

export async function GET(_req: NextRequest) {
  // Added _ to req as it's not used directly
  // --- Authentication & Authorization ---
  // const { isAdmin, error, status } = await verifyAdminAuth(req);
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
  } catch (err: unknown) {
    // Changed from any
    const errorMessage =
      err instanceof Error ? err.message : "An unknown error occurred";
    console.error(
      "[API GET /api/admin/submissions] Error fetching submissions:",
      errorMessage,
      err
    );
    return NextResponse.json(
      { message: "Failed to fetch submissions", detail: errorMessage },
      { status: 500 }
    );
  }
}
