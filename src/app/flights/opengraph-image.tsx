import { ogCard, ogSize, ogContentType } from "@/lib/og";
export const runtime = "nodejs";
export const alt = "Flights on BruFly";
export const size = ogSize;
export const contentType = ogContentType;
export default function Image() {
  return ogCard({ eyebrow: "Flights", title: "Domestic flights, checked by a real person", subtitle: "FlySafair and LIFT routes across South Africa. Live fare confirmed before you pay.", meta: ["JNB · CPT · DUR · GRJ · PLZ · ELS · BFN · MQP"] });
}
