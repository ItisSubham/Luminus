import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const AuthCallbackPage = async () => {
  const user = await currentUser();

  if (!user?.id || !user?.primaryEmailAddress?.emailAddress) {
    return redirect("/signin");
  }

  const dbUser = await db.user.findFirst({
    where: {
      clerkId: user.id,
    },
  });

  if (!dbUser) {
    console.log("AUTH-CALLBACK: Creating new user");
    console.log("AUTH-CALLBACK: user.firstName:", user.firstName);
    console.log("AUTH-CALLBACK: user.firstName type:", typeof user.firstName);

    // Robust firstName handling
    let firstName = "User"; // Default fallback
    if (
      user.firstName &&
      typeof user.firstName === "string" &&
      user.firstName.trim() !== ""
    ) {
      firstName = user.firstName.trim();
    }
    console.log("AUTH-CALLBACK: Final firstName:", firstName);

    await db.user.create({
      data: {
        id: user.id,
        clerkId: user.id,
        email: user.primaryEmailAddress.emailAddress,
        firstName: firstName,
        lastName: user.lastName || "",
        image: user.imageUrl,
      },
    });

    redirect("/onboarding");
  }

  redirect("/dashboard");
};

export default AuthCallbackPage;
