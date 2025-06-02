// src/app/api/admin/submissions/[submissionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin from "@/firebase/firebaseAdmin";
import { Bucket } from "@google-cloud/storage";

// Firebase services setup
let db: FirebaseFirestore.Firestore;
let storage: ReturnType<typeof admin.storage>;
let bucket: Bucket;

try {
  db = admin.firestore();
  storage = admin.storage();
  bucket = storage.bucket();
  if (
    typeof db.collection !== "function" ||
    typeof bucket.file !== "function"
  ) {
    throw new Error("Firebase services not initialized correctly.");
  }
} catch (e: unknown) {
  const errorMessage =
    e instanceof Error ? e.message : "Unknown error during Firebase Admin init";
  console.error(
    "CRITICAL: Failed to initialize Firebase Admin services in [submissionId] API route:",
    errorMessage,
    e
  );
}

// Define local type for updates
interface LocalUpdateData {
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  aadharPhoneNumber?: string;
  hometownLocation?: string;
  bloodGroup?: string;
  email?: string | null;
  message?: string | null;
  aadharNumber?: string | null;
  adminNotes?: Record<string, string> | null;
  adminUploadedDocUrl?: string | null;
}

// Shared context type to avoid destructuring in the params
type RouteContext = {
  params: Promise<{
    submissionId: string;
  }>;
};

// GET a single submission
export async function GET(req: NextRequest, context: RouteContext) {
  const { submissionId } = await context.params;
  void req; // Avoid unused var lint warning

  if (!db) {
    return NextResponse.json(
      { message: "Internal Server Error: Database service not available." },
      { status: 500 }
    );
  }

  if (!submissionId) {
    return NextResponse.json(
      { message: "Submission ID is required." },
      { status: 400 }
    );
  }

  try {
    const docRef = db.collection("contactSubmissions").doc(submissionId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { message: "Submission not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`[API GET /${submissionId}] Error:`, errorMessage, error);
    return NextResponse.json(
      { message: "Failed to fetch submission.", detail: errorMessage },
      { status: 500 }
    );
  }
}

// PUT (update) a submission
export async function PUT(req: NextRequest, context: RouteContext) {
  const { submissionId } = await context.params;

  if (!db) {
    return NextResponse.json(
      { message: "Internal Server Error: Database service not available." },
      { status: 500 }
    );
  }

  if (!submissionId) {
    return NextResponse.json(
      { message: "Submission ID is required." },
      { status: 400 }
    );
  }

  try {
    const body = (await req.json()) as LocalUpdateData;
    const docRef = db.collection("contactSubmissions").doc(submissionId);

    const dataToUpdate: FirebaseFirestore.UpdateData<Record<string, any>> = {};
    const allowedFields: (keyof LocalUpdateData)[] = [
      "firstName",
      "lastName",
      "fatherName",
      "aadharPhoneNumber",
      "hometownLocation",
      "bloodGroup",
      "email",
      "message",
      "aadharNumber",
      "adminNotes",
      "adminUploadedDocUrl",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        dataToUpdate[field] = body[field];
      }
    });

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { message: "No valid fields provided for update." },
        { status: 400 }
      );
    }

    dataToUpdate.lastAdminEditAt = admin.firestore.FieldValue.serverTimestamp();

    await docRef.update(dataToUpdate);
    return NextResponse.json({
      message: "Submission updated successfully",
      id: submissionId,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`[API PUT /${submissionId}] Error:`, errorMessage, error);
    return NextResponse.json(
      { message: "Failed to update submission.", detail: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE a submission
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { submissionId } = await context.params;
  void req;

  if (!db || !bucket) {
    return NextResponse.json(
      { message: "Internal Server Error: Firebase services not available." },
      { status: 500 }
    );
  }

  if (!submissionId) {
    return NextResponse.json(
      { message: "Submission ID is required." },
      { status: 400 }
    );
  }

  try {
    const docRef = db.collection("contactSubmissions").doc(submissionId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { message: "Submission not found." },
        { status: 404 }
      );
    }

    const submissionData = docSnap.data();
    const filesToDelete = [
      submissionData?.aadharPhotoUrl,
      submissionData?.adminUploadedDocUrl,
    ];

    for (const fileUrl of filesToDelete) {
      if (fileUrl && typeof fileUrl === "string") {
        try {
          const urlParts = fileUrl.split(`/${bucket.name}/`);
          if (urlParts.length > 1) {
            const filePath = decodeURIComponent(urlParts[1].split("?")[0]);
            if (filePath) {
              await bucket.file(filePath).delete({ ignoreNotFound: true });
            }
          }
        } catch (storageError: unknown) {
          const storageErrorMessage =
            storageError instanceof Error
              ? storageError.message
              : "Unknown storage error";
          console.error(
            `[API DELETE] Error deleting file ${fileUrl}:`,
            storageErrorMessage,
            storageError
          );
        }
      }
    }

    await docRef.delete();
    return NextResponse.json({
      message: "Submission deleted successfully",
      id: submissionId,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(`[API DELETE /${submissionId}] Error:`, errorMessage, error);
    return NextResponse.json(
      { message: "Failed to delete submission.", detail: errorMessage },
      { status: 500 }
    );
  }
}
