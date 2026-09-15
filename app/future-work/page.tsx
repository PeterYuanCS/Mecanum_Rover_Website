import type { Metadata } from "next";
import { FutureWorkExperience } from "@/components/experience/FutureWorkExperience";

export const metadata: Metadata = {
  title: "Future Work — Mecanum Rover",
  description: "Future design directions for the ESP32 mecanum rover.",
};

export default function FutureWorkPage() {
  return <FutureWorkExperience />;
}
