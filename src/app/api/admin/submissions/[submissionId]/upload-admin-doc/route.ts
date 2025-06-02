// src/app/api/admin/submissions/[submissionId]/upload-admin-doc/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin from "@/firebase/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
// import { verifyAdminAuth } from '@/lib/server/adminAuthUtils';

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
    const file = formData.get("adminDocument") as File | null;

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

    const bucket = admin.storage().bucket();
    const uniqueFilename = `admin_documents/${submissionId}/${uuidv4()}-${
      file.name
    }`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const storageFile = bucket.file(uniqueFilename);

    await storageFile.save(fileBuffer, {
      metadata: { contentType: file.type },
    });

    await storageFile.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storageFile.name}`;

    return NextResponse.json({
      message: "Document uploaded successfully",
      fileUrl: publicUrl,
    });
  } catch (error: unknown) {
    // Changed from any
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(
      `[API POST /api/admin/submissions/${submissionId}/upload-admin-doc] Error:`,
      errorMessage,
      error
    );
    return NextResponse.json(
      { message: "Failed to upload document.", detail: errorMessage },
      { status: 500 }
    );
  }
}
