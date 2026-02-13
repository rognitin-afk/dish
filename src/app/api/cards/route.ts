import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Card from "@/models/Card";

/** GET: List all cards, newest first */
export async function GET() {
  try {
    await connectDB();
    const cards = await Card.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(cards);
  } catch (error) {
    console.error("GET cards error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

/** POST: Create a card (title, description, image). Image is typically secure_url from Cloudinary. */
export async function POST(request: Request) {
  let body: { title?: string; description?: string; image?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const description =
    typeof body?.description === "string" ? body.description.trim() : "";
  const image = typeof body?.image === "string" ? body.image.trim() : "";

  if (!title || !image) {
    return NextResponse.json(
      { error: "title and image are required" },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    const card = await Card.create({ title, description, image });
    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("POST card error:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}

/** DELETE: Remove a card by id. Body: { id: string } */
export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = body?.id;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await connectDB();
    await Card.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("DELETE card error:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}
