import { useUserData } from "@/context/UserDataContext";
import { Navigate } from "react-router-dom";
import Onboarding from "./Onboarding";

export default function Index() {
  const { isOnboarded } = useUserData();

  if (isOnboarded) return <Navigate to="/dashboard" replace />;

  return <Onboarding />;
}
