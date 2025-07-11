import { db, StepOneSchema } from "@/lib";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: Request) {
  const body = await request.json();

  const { age, bloodGroup, gender, height, weight } = StepOneSchema.parse(body);

  const user = await currentUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!age || !bloodGroup || !gender || !height || !weight) {
    return new NextResponse("Invalid data passed", { status: 422 });
  }

  const dbUser = await db.user.findFirst({
    where: {
      clerkId: user.id,
    },
  });

  try {
    if (!dbUser) {
      // Enhanced debug logging
      console.log("User object:", JSON.stringify(user, null, 2));
      console.log("user.firstName type:", typeof user.firstName);
      console.log("user.firstName value:", user.firstName);
      console.log("user.firstName === null:", user.firstName === null);
      console.log(
        "user.firstName === undefined:",
        user.firstName === undefined
      );
      console.log("Fallback result:", user.firstName || "User");

      // Robust firstName handling
      let firstName = "User"; // Default fallback
      if (
        user.firstName &&
        typeof user.firstName === "string" &&
        user.firstName.trim() !== ""
      ) {
        firstName = user.firstName.trim();
      }
      console.log("Final firstName value:", firstName);
      console.log("Final firstName type:", typeof firstName);

      await db.user.create({
        data: {
          id: user.id,
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress!,
          firstName: firstName,
          lastName: user.lastName || "",
          image: user.imageUrl,
          age,
          bloodGroup,
          gender,
          height,
          weight,
        },
      });
    } else {
      // Update existing user with onboarding data AND refresh name data from Clerk
      // Robust firstName handling for update
      let firstName = "User"; // Default fallback
      if (
        user.firstName &&
        typeof user.firstName === "string" &&
        user.firstName.trim() !== ""
      ) {
        firstName = user.firstName.trim();
      }
      console.log("UPDATE: Final firstName value:", firstName);

      await db.user.update({
        where: {
          clerkId: user.id,
        },
        data: {
          firstName: firstName, // Update firstName from Clerk
          lastName: user.lastName || "", // Update lastName from Clerk
          age,
          bloodGroup,
          gender,
          height,
          weight,
        },
      });
    }

    return NextResponse.json("User updated!", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data passed", { status: 422 });
    }

    return new NextResponse("Could not update user", { status: 500 });
  }
}
