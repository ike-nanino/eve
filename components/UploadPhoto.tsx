"use client"

import { useState } from "react"
// import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"


export default function UploadPhoto({ onUpload }: { onUpload: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  // const handleUpload = async () => {
  //   if (!file) return
  //   setUploading(true)

  //   const storageRef = ref(storage, `profile-pictures/${file.name}-${Date.now()}`)
  //   await uploadBytes(storageRef, file)
  //   const downloadURL = await getDownloadURL(storageRef)

  //   setUploading(false)
  //   onUpload(downloadURL)
  // }

  return (
    <div className="space-y-3">
      {preview && (
        <Image
          src={preview}
          alt="Preview"
          width={120}
          height={120}
          className="rounded-full object-cover"
        />
      )}

      <h1 className="font-medium mb-2">Upload Photo</h1>
      <Input type="file" accept="image/*" onChange={handleChange} className="max-w-md" />

      <Button disabled={!file || uploading} className="my-4">
        {uploading ? "Uploading..." : "Save"}
      </Button>
    </div>
  )
}