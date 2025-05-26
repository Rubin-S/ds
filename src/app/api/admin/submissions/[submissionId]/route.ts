// src/app/api/admin/submissions/[submissionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin from "@/firebase/firebaseAdmin"; // Ensure this path is correct
// import { verifyAdminAuth } from '@/lib/server/adminAuthUtils'; // Your server-side auth verification

interface UpdateData {
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
  // No id, submittedAt
}

// GET a single submission by ID (Optional, if needed directly)
export async function GET(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  const { submissionId } = params;

  // --- Authentication & Authorization ---
  // const { isAdmin, error, status } = await verifyAdminAuth(req);
  // if (!isAdmin) return NextResponse.json({ message: error || "Unauthorized" }, { status: status || 401 });

  if (!submissionId) {
    return NextResponse.json(
      { message: "Submission ID is required." },
      { status: 400 }
    );
  }

  try {
    const db = admin.firestore();
    const docRef = db.collection("contactSubmissions").doc(submissionId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { message: "Submission not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() });
  } catch (error: any) {
    console.error(
      `[API GET /api/admin/submissions/${submissionId}] Error:`,
      error
    );
    return NextResponse.json(
      { message: "Failed to fetch submission.", detail: error.message },
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

  // --- Authentication & Authorization ---
  // const { isAdmin, error, status } = await verifyAdminAuth(req);
  // if (!isAdmin) return NextResponse.json({ message: error || "Unauthorized" }, { status: status || 401 });

  if (!submissionId) {
    return NextResponse.json(
      { message: "Submission ID is required." },
      { status: 400 }
    );
  }

  try {
    const body = (await req.json()) as UpdateData;
    const db = admin.firestore();
    const docRef = db.collection("contactSubmissions").doc(submissionId);

    // Construct object with only allowed fields to prevent unwanted updates
    const dataToUpdate: Record<string, any> = {};
    const allowedFields: (keyof UpdateData)[] = [
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
  } catch (error: any) {
    console.error(
      `[API PUT /api/admin/submissions/${submissionId}] Error:`,
      error
    );
    return NextResponse.json(
      { message: "Failed to update submission.", detail: error.message },
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

  // --- Authentication & Authorization ---
  // const { isAdmin, error, status } = await verifyAdminAuth(req);
  // if (!isAdmin) return NextResponse.json({ message: error || "Unauthorized" }, { status: status || 401 });

  if (!submissionId) {
    return NextResponse.json(
      { message: "Submission ID is required." },
      { status: 400 }
    );
  }

  try {
    const db = admin.firestore();
    const storage = admin.storage().bucket();
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
          const urlParts = fileUrl.split(`/${storage.name}/`);
          if (urlParts.length > 1) {
            const filePath = decodeURIComponent(urlParts[1].split("?")[0]);
            if (filePath) {
              // Ensure filePath is not empty
              await storage.file(filePath).delete({ ignoreNotFound: true });
            }
          }
        } catch (storageError: any) {
          console.error(
            `[API DELETE] Error deleting file ${fileUrl} from Storage:`,
            storageError.message
          );
          // Continue with Firestore deletion even if storage deletion fails for one file
        }
      }
    }

    await docRef.delete();
    return NextResponse.json({
      message: "Submission deleted successfully",
      id: submissionId,
    });
  } catch (error: any) {
    console.error(
      `[API DELETE /api/admin/submissions/${submissionId}] Error:`,
      error
    );
    return NextResponse.json(
      { message: "Failed to delete submission.", detail: error.message },
      { status: 500 }
    );
  }
}
