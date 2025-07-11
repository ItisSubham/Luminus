import { db } from "@/lib";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { firstName, lastName } = body;

    if (
      !firstName ||
      typeof firstName !== "string" ||
      firstName.trim() === ""
    ) {
      return new NextResponse("First name is required", { status: 400 });
    }

    console.log("UPDATE-NAME: Updating user name manually");
    console.log("UPDATE-NAME: firstName:", firstName);
    console.log("UPDATE-NAME: lastName:", lastName);

    // Update the user in the database with manually provided names
    await db.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        firstName: firstName.trim(),
        lastName: (lastName || "").trim(),
      },
    });

    return NextResponse.json(
      {
        message: "Name updated successfully",
        firstName: firstName.trim(),
        lastName: (lastName || "").trim(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE-NAME: Error updating name:", error);
    return new NextResponse("Could not update name", { status: 500 });
  }
}
