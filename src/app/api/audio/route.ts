import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Audio from "@/models/Audio";

/** GET: List all audio, newest first */
export async function GET() {
  try {
    await connectDB();
    const list = await Audio.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(list);
  } catch (error) {
    console.error("GET audio error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audio" },
      { status: 500 }
    );
  }
}

/** POST: Save audio after client uploaded to Cloudinary. Body: { name: string, src: string } */
export async function POST(request: Request) {
  let body: { name?: string; src?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const src = typeof body?.src === "string" ? body.src.trim() : "";
  if (!name || !src) {
    return NextResponse.json(
      { error: "name and src are required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const doc = await Audio.create({ name, src });
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error("POST audio error:", error);
    return NextResponse.json(
      { error: "Failed to save audio" },
      { status: 500 }
    );
  }
}

/** DELETE: Remove audio by id. Body: { id: string } */
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = body?.id;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await connectDB();
    await Audio.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("DELETE audio error:", error);
    return NextResponse.json(
      { error: "Failed to delete" },
      { status: 500 }
    );
  }
}
