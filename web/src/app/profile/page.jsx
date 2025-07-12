import React from "react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import LawyerRegistrationForm from "./components/LawyerRegistrationForm";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import LawyerProfile from "./components/lawyer-profile";

const Profile = async () => {
  const user = await currentUser();
  if (!user) {
    return (
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
    );
  }

  const isMyLawyer = await prisma.lawyer.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!isMyLawyer) {
    return (
      <SignedIn>
        <div>
          <LawyerRegistrationForm />
        </div>
      </SignedIn>
    );
  }

  return (
    <div>
      <SignedOut>
        <SignInButton />
        <SignUpButton />
      </SignedOut>
      <SignedIn></SignedIn>
      <SignedIn>
        <LawyerProfile lawyer={isMyLawyer} />
      </SignedIn>
    </div>
  );
};

export default Profile;
