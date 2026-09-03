"use client";

import { useRouter } from "next/navigation";
import { PiUserCircleDashedFill } from "react-icons/pi";

import { useUser } from "@/context/UserContext";

import UserDropDown from "../userDropDown/UserDropDown";

const UserStatusIcon = () => {
  const router = useRouter();
  const { isLoggedIn } = useUser();

  return (
    <div className="hidden lg:block">
      {isLoggedIn ? (
        <UserDropDown />
      ) : (
        <div className="relative flex items-center">
          <PiUserCircleDashedFill
            onClick={() => router.push("/auth/signup")}
            className="cursor-pointer text-[2.3rem] text-[#ddd] md:text-[2.7rem]"
          />
        </div>
      )}
    </div>
  );
};

export default UserStatusIcon;
