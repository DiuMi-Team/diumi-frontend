import { ModeSelect } from "@/components/home/ModeSelect";

export default function FastfoodModePage() {
  return (
    <ModeSelect
      serviceName="패스트푸드"
      realHref="/fastfood/real"
      practiceHref="/fastfood/practice"
    />
  );
}
