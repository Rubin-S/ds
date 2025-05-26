// src/app/api/admin/submissions/[submissionId]/upload-admin-doc/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin from "@/firebase/firebaseAdmin"; // Ensure this path is correct
import { v4 as uuidv4 } from "uuid";
// import { verifyAdminAuth } from '@/lib/server/adminAuthUtils'; // Your server-side auth verification

export async function POST(
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
    const formData = await req.formData();
    const file = formData.get("adminDocument") as File | null; // Key used in frontend FormData

    if (!file) {
      return NextResponse.json(
        { message: "No document file provided." },
        { status: 400 }
      );
    }
    if (file.size === 0) {
      return NextResponse.json(
        { message: "Document file is empty." },
        { status: 400 }
      );
    }
    // Add PDF type check if strictly needed:
    // if (file.type !== 'application/pdf') {
    //   return NextResponse.json({ message: 'Only PDF files are allowed for admin documents.' }, { status: 400 });
    // }

    const bucket = admin.storage().bucket();
    // Store in a structured path, e.g., admin_documents/submission_id/unique_file_name.pdf
    const uniqueFilename = `admin_documents/${submissionId}/${uuidv4()}-${
      file.name
    }`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const storageFile = bucket.file(uniqueFilename);

    await storageFile.save(fileBuffer, {
      metadata: { contentType: file.type },
    });

    await storageFile.makePublic(); // Or use getSignedUrl for more secure access
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storageFile.name}`;

    // Optionally: Update the Firestore document with this URL directly here,
    // OR return the URL for the client to include in a subsequent PUT request.
    // For simplicity, we'll return the URL.
    // If updating directly:
    // const db = admin.firestore();
    // await db.collection('contactSubmissions').doc(submissionId).update({
    //   adminUploadedDocUrl: publicUrl,
    //   lastAdminEditAt: admin.firestore.FieldValue.serverTimestamp()
    // });

    return NextResponse.json({
      message: "Document uploaded successfully",
      fileUrl: publicUrl,
    });
  } catch (error: any) {
    console.error(
      `[API POST /api/admin/submissions/${submissionId}/upload-admin-doc] Error:`,
      error
    );
    return NextResponse.json(
      { message: "Failed to upload document.", detail: error.message },
      { status: 500 }
    );
  }
}
