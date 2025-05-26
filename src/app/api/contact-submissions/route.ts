// src/app/api/contact-submissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin from "@/firebase/firebaseAdmin"; // Ensure this path is correct
import { v4 as uuidv4 } from "uuid";
// Writable is not directly used in the final code, but often part of stream handling if it were more complex
// import { Writable } from "stream";
import { Bucket } from "@google-cloud/storage";

let db: FirebaseFirestore.Firestore | undefined;
let storageAdmin;
let bucket: Bucket | undefined; // Ensure bucket can be undefined initially

// Initialize Firebase Admin services
try {
  db = admin.firestore();
  storageAdmin = admin.storage();
  bucket = storageAdmin.bucket();
} catch (e: any) {
  // This is a critical error that should be logged on the server,
  // even if other console logs are removed.
  // Consider a more robust logging solution for production if this happens.
  console.error(
    "CRITICAL: Failed to initialize Firebase Admin services in API route:",
    e.message
  );
  // db and bucket will remain undefined, and requests will fail.
}

// Helper to upload file stream to Firebase Storage
async function uploadFileToStorage(
  file: File,
  uniqueFilename: string
): Promise<string | null> {
  if (!bucket) {
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

    stream.on("error", (err) => {
      reject(err);
    });

    stream.on("finish", async () => {
      try {
        await storageFile.makePublic(); // Or use getSignedUrl for better security
        const publicUrl = `https://storage.googleapis.com/${bucket?.name}/${storageFile.name}`;
        resolve(publicUrl);
      } catch (publicError) {
        reject(publicError);
      }
    });

    stream.end(fileBuffer);
  });
}

export async function POST(req: NextRequest) {
  if (!db || !bucket) {
    return NextResponse.json(
      {
        message:
          "Internal Server Error: Firebase services not properly initialized.",
      },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const fields: Record<string, any> = {};
    let aadharPhotoFile: File | null = null;

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (key === "aadharPhoto") {
          aadharPhotoFile = value;
        }
      } else {
        fields[key] = value;
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
    } = fields;

    if (
      !firstName ||
      !lastName ||
      !fatherName ||
      !aadharPhoneNumber ||
      !hometownLocation ||
      !bloodGroup
    ) {
      return NextResponse.json(
        {
          message:
            "Please fill in all required fields: First Name, Last Name, Father's Name, Phone Number, Hometown, and Blood Group.",
        },
        { status: 400 }
      );
    }

    const submissionData = {
      firstName,
      lastName,
      fatherName,
      aadharPhoneNumber,
      hometownLocation,
      bloodGroup,
      email: email || null,
      message: message || null,
      aadharPhotoUrl: imageUrl || null,
      aadharNumber: aadharNumber || null,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),

      // New fields for admin dashboard:
      adminUploadedDocUrl: String || null, // URL of the PDF uploaded by admin
      adminNotes: Object || null, // For flexible text columns (key-value pairs)
      // Example: { "Follow-up Action": "Called on 2025-06-01", "Status": "Pending Review" }
      lastAdminEditAt: admin.firestore.FieldValue.serverTimestamp(), // To track when an admin last modified this record
    };

    const docRef = await db
      .collection("contactSubmissions")
      .add(submissionData);

    return NextResponse.json(
      {
        id: docRef.id,
        message: "Submission received successfully!",
        data: submissionData, // You might want to remove sending back all data in production
      },
      { status: 201 }
    );
  } catch (error: any) {
    // This is a critical error catch-all for the POST handler.
    // It's advisable to log this error on the server for debugging.
    // Consider a more robust logging solution for production.
    console.error(
      "Error in POST /api/contact-submissions:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      {
        message: "Failed to process submission on server.",
        detail: error.message, // Be cautious about sending detailed error messages to the client
      },
      { status: 500 }
    );
  }
}
