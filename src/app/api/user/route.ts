import { db } from "@/config/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { uid, email, displayName } = await req.json();

    if (!uid || !email) {
      return NextResponse.json({ error: 'Missing uid or email' }, { status: 400 });
    }

    const userDocRef = db.collection("users").doc(uid);
    const userDoc = await userDocRef.get();

    // Check if the user document already exists
    if (userDoc.exists) {
      return NextResponse.json({ message: 'User document already exists.' }, { status: 200 });
    }

    // Create the user document if it doesn't exist
    await userDocRef.set({
      email,
      displayName: displayName || null,
      createdAt: FieldValue.serverTimestamp(),
      followedTopics: [],
    });

    return NextResponse.json({ message: 'User document created successfully.' }, { status: 201 });

  } catch (error) {
    console.error("Error in /api/user:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
