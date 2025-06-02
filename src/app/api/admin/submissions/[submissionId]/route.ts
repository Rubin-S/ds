// src/app/api/admin/submissions/[submissionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin from "@/firebase/firebaseAdmin"; // Ensure this path alias resolves correctly to your firebaseAdmin.js/ts
import { Bucket } from "@google-cloud/storage"; // For explicit Bucket type

// Ensure Firebase Admin is initialized and services are correctly accessed
let db: FirebaseFirestore.Firestore;
let storage: ReturnType<typeof admin.storage>; // Type for the storage service
let bucket: Bucket; // Type for the bucket object

try {
  db = admin.firestore();
  storage = admin.storage(); // Get the storage service
  bucket = storage.bucket(); // Get the default bucket from the service
  if (
    typeof db.collection !== "function" ||
    typeof bucket.file !== "function"
  ) {
    throw new Error(
      "Firebase services not initialized correctly. Check firebaseAdmin.js setup and permissions."
    );
  }
} catch (e: unknown) {
  const errorMessage =
    e instanceof Error ? e.message : "Unknown error during Firebase Admin init";
  console.error(
    "CRITICAL: Failed to initialize Firebase Admin services in [submissionId] API route:",
    errorMessage,
    e
  );
  // If initialization fails, subsequent calls will error.
  // Consider how to handle this globally if admin init fails.
}

// Define UpdateData locally to ensure it's not mistaken for a generic
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

// GET a single submission by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  const { submissionId } = params;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unusedReq = req; // If req is truly unused for GET by ID

  if (!db) {
    // Check if db was initialized
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
    console.error(
      `[API GET /api/admin/submissions/${submissionId}] Error:`,
      errorMessage,
      error
    );
    return NextResponse.json(
      { message: "Failed to fetch submission.", detail: errorMessage },
      { status: 500 }
    );
  }
}

// PUT (Update) a submission
export async function PUT(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  const { submissionId } = params;

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
    const body = (await req.json()) as LocalUpdateData; // Use the locally defined interface
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
    console.error(
      `[API PUT /api/admin/submissions/${submissionId}] Error:`,
      errorMessage,
      error
    );
    return NextResponse.json(
      { message: "Failed to update submission.", detail: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE a submission
export async function DELETE(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  const { submissionId } = params;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unusedReq = req;

  if (!db || !bucket) {
    // Check for bucket initialization too
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

    const filesToDelete: (string | undefined | null)[] = [
      submissionData?.aadharPhotoUrl,
      submissionData?.adminUploadedDocUrl,
    ];

    for (const fileUrl of filesToDelete) {
      if (fileUrl && typeof fileUrl === "string") {
        try {
          const urlParts = fileUrl.split(`/${bucket.name}/`); // Use initialized bucket
          if (urlParts.length > 1) {
            const filePath = decodeURIComponent(urlParts[1].split("?")[0]);
            if (filePath) {
              await bucket.file(filePath).delete({ ignoreNotFound: true }); // Use initialized bucket
            }
          }
        } catch (storageError: unknown) {
          const storageErrorMessage =
            storageError instanceof Error
              ? storageError.message
              : "An unknown storage error";
          console.error(
            `[API DELETE] Error deleting file ${fileUrl} from Storage:`,
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
    console.error(
      `[API DELETE /api/admin/submissions/${submissionId}] Error:`,
      errorMessage,
      error
    );
    return NextResponse.json(
      { message: "Failed to delete submission.", detail: errorMessage },
      { status: 500 }
    );
  }
}
