import ContactInfo from "@/components/ContactInfo";
import GeneralInfo from "@/components/GeneralInfo";
import SecuritySettings from "@/components/SecuritySettings";


export default function SettingsPage() {
  return (
    <div className="space-y-10 mt-20 p-6 max-w-5xl mx-auto">
      <GeneralInfo />
      <ContactInfo />
      <SecuritySettings />
    </div>
  )
}