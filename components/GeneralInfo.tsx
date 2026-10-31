"use client";

import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import UploadPhoto from "./UploadPhoto";


export default function GeneralInfo() {
  const [photoURL, setPhotoURL] = useState("")

  return (
    <div className="border p-6 rounded-md shadow">
      <h2 className="font-semibold mb-4">General Information</h2>
      <UploadPhoto onUpload={url => {
        setPhotoURL(url)
        // save this to user profile in Firebase or your DB
      }} />


      <Card className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">General Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input disabled value="9909323285" placeholder="Account No" />
        <Input disabled value="Savings" placeholder="Account Type" />
        <Input disabled value="princessowen81@gmail.com" placeholder="Email" />
        <Input disabled value="1985-10-05" placeholder="Date Of Birth" />
        <Input disabled value="Nurse" placeholder="Occupation" />
        <Input disabled value="3477079854" placeholder="Phone Number" />
        <Input disabled value="Female" placeholder="Gender" />
        <Input disabled value="Single" placeholder="Marital Status" />
      </div>
    </Card>
    </div>
  )
}