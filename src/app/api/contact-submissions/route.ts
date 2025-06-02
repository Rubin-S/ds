// src/app/api/contact-submissions/route.ts
import { NextRequest, NextResponse } from "next/server";
// Corrected import path - Assuming @/ maps to your src directory
import admin from "@/firebase/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

// Ensure Firebase Admin is initialized and services are correctly accessed
let db: FirebaseFirestore.Firestore;
import type { Bucket } from "@google-cloud/storage";
let bucket: Bucket; // Correct type for bucket

try {
  db = admin.firestore();
  bucket = admin.storage().bucket();
  if (
    typeof db.collection !== "function" ||
    typeof bucket.file !== "function"
  ) {
    throw new Error(
      "Firebase services not initialized correctly in contact-submissions. Check firebaseAdmin.js setup."
    );
  }
} catch (e: unknown) {
  const errorMessage =
    e instanceof Error ? e.message : "Unknown error during Firebase Admin init";
  console.error(
    "CRITICAL: Failed to initialize Firebase Admin services in contact-submissions API route:",
    errorMessage,
    e
  );
}

async function uploadFileToStorage(
  file: File,
  uniqueFilename: string
): Promise<string | null> {
  if (!bucket) {
    console.error(
      "[API /api/contact-submissions - uploadFileToStorage] Firebase Storage bucket is not initialized."
    );
    throw new Error("Firebase Storage bucket is not initialized.");
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const storageFile = bucket.file(uniqueFilename);

  return new Promise((resolve, reject) => {
    const stream = storageFile.createWriteStream({
      metadata: {
        contentType: file.type,
      },
    });

    stream.on("error", (err: Error) => {
      // Typed err parameter
      console.error(
        "[API /api/contact-submissions - uploadFileToStorage] Stream error during upload:",
        err
      );
      reject(err);
    });

    stream.on("finish", async () => {
      try {
        await storageFile.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storageFile.name}`;
        resolve(publicUrl);
      } catch (publicError: unknown) {
        const publicErrorMessage =
          publicError instanceof Error
            ? publicError.message
            : "Unknown error making file public";
        console.error(
          "[API /api/contact-submissions - uploadFileToStorage] Error making file public or getting URL:",
          publicErrorMessage,
          publicError
        );
        reject(publicError);
      }
    });
    stream.end(fileBuffer);
  });
}

interface DestructuredFields {
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  aadharPhoneNumber?: string;
  hometownLocation?: string;
  bloodGroup?: string;
  email?: string;
  message?: string;
  aadharNumber?: string;
}

export async function POST(req: NextRequest) {
  if (!db || !bucket) {
    console.error(
      "[API /api/contact-submissions] Firestore (db) or Storage Bucket is not initialized. Aborting request."
    );
    return NextResponse.json(
      { message: "Internal Server Error: Firebase services not initialized." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const fields: Record<string, string> = {};
    let aadharPhotoFile: File | null = null;

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (key === "aadharPhoto") {
          aadharPhotoFile = value;
        }
      } else {
        fields[key] = value as string;
      }
    }

    let imageUrl: string | null = null;
    if (aadharPhotoFile && aadharPhotoFile.size > 0) {
      const uniqueFilename = `aadhar_photos/${uuidv4()}-${
        aadharPhotoFile.name
      }`;
      imageUrl = await uploadFileToStorage(aadharPhotoFile, uniqueFilename);
    }

    const {
      firstName,
      lastName,
      fatherName,
      aadharPhoneNumber,
      hometownLocation,
      bloodGroup,
      email,
      message,
      aadharNumber,
    }: DestructuredFields = fields;

    const submissionData = {
      firstName: typeof firstName === "string" ? firstName : null,
      lastName: typeof lastName === "string" ? lastName : null,
      fatherName: typeof fatherName === "string" ? fatherName : null,
      aadharPhoneNumber:
        typeof aadharPhoneNumber === "string" ? aadharPhoneNumber : null,
      hometownLocation:
        typeof hometownLocation === "string" ? hometownLocation : null,
      bloodGroup: typeof bloodGroup === "string" ? bloodGroup : null,
      email: typeof email === "string" && email.trim() !== "" ? email : null,
      message:
        typeof message === "string" && message.trim() !== "" ? message : null,
      aadharPhotoUrl: imageUrl || null,
      aadharNumber:
        typeof aadharNumber === "string" && aadharNumber.trim() !== ""
          ? aadharNumber
          : null,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db
      .collection("contactSubmissions")
      .add(submissionData);

    return NextResponse.json(
      {
        id: docRef.id,
        message: "Submission received successfully!",
        data: submissionData,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Changed from any
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error(
      `Error in POST /api/contact-submissions: ${errorMessage}`,
      errorStack
    );
    return NextResponse.json(
      {
        message: "Failed to process submission on server.",
        detail: errorMessage,
      },
      { status: 500 }
    );
  }
}
