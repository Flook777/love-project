'use client' // บอก Next.js ว่านี่คือ Client Component (ทำงานฝั่ง Browser)

import { CldUploadButton } from 'next-cloudinary';

interface UploadButtonProps {
  onUploadSuccess: (result: any) => void; // ฟังก์ชันที่จะเรียกเมื่ออัปโหลดเสร็จ
}

export default function UploadButton({ onUploadSuccess }: UploadButtonProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer">
      <CldUploadButton 
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        options={{ sources: ['local', 'url'], multiple: false }}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition w-full"
        onSuccess={(result) => {
          console.log("Upload Success:", result);
          onUploadSuccess(result);
        }}
      >
        📸 อัปโหลดรูปภาพ
      </CldUploadButton>
    </div>
  );
}