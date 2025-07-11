import { db } from "@/lib";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await currentUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Robust firstName handling
    let firstName = "User"; // Default fallback
    if (
      user.firstName &&
      typeof user.firstName === "string" &&
      user.firstName.trim() !== ""
    ) {
      firstName = user.firstName.trim();
    }

    console.log("SYNC: Updating user name from Clerk");
    console.log("SYNC: Clerk firstName:", user.firstName);
    console.log("SYNC: Final firstName:", firstName);
    console.log("SYNC: Clerk lastName:", user.lastName);

    // Update the user in the database with current Clerk data
    await db.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        firstName: firstName,
        lastName: user.lastName || "",
        email: user.primaryEmailAddress?.emailAddress!,
        image: user.imageUrl,
      },
    });

    return NextResponse.json(
      {
        message: "User synced successfully",
        firstName: firstName,
        lastName: user.lastName || "",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("SYNC: Error syncing user:", error);
    return new NextResponse("Could not sync user", { status: 500 });
  }
}
