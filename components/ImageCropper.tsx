'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'

// Helper function to create the cropped image
const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

const getCroppedImg = async (imageSrc: string, pixelCrop: any) => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise<string>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        // Convert blob to base64 or object URL (here using base64 for simplicity with Cloudinary upload later if needed, 
        // but typically you re-upload. For now, we will return a blob URL to preview)
        const previewUrl = URL.createObjectURL(blob)
        resolve(previewUrl)
        // Note: ในการใช้งานจริง ถ้าจะอัปโหลดรูปที่ crop แล้วขึ้น Cloudinary ใหม่ ต้องแปลงเป็น File object
        // แต่ใน scope นี้ เราจะส่ง previewUrl ให้ user เห็นก่อน 
        // (Advance: ต้องอัปโหลด blob นี้ไป Cloudinary อีกรอบ)
      }
    }, 'image/jpeg')
  })
}

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedImage: string, blob: Blob) => void
  onCancel: () => void
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop)
  }

  const onZoomChange = (zoom: number) => {
    setZoom(zoom)
  }

  const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImgBlob(imageSrc, croppedAreaPixels)
      if (croppedImageBlob) {
         // Create a fake URL for preview
         const previewUrl = URL.createObjectURL(croppedImageBlob)
         onCropComplete(previewUrl, croppedImageBlob)
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg h-96 bg-gray-900 rounded-xl overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1} // สัดส่วน 1:1 (สี่เหลี่ยมจัตุรัส) หรือเปลี่ยนเป็น 4/3, 16/9 ได้
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteHandler}
          onZoomChange={onZoomChange}
        />
      </div>
      
      <div className="mt-4 w-full max-w-lg">
        <label className="text-white text-sm mb-1 block">Zoom</label>
        <input
          type="range"
          value={zoom}
          min={1}
          max={3}
          step={0.1}
          aria-labelledby="Zoom"
          onChange={(e) => {
            setZoom(Number(e.target.value))
          }}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      <div className="flex gap-4 mt-6">
        <button 
          onClick={onCancel}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          ยกเลิก
        </button>
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 font-bold"
        >
          ตัดรูป (Crop)
        </button>
      </div>
    </div>
  )
}

// Helper: Get Blob directly (for uploading)
async function getCroppedImgBlob(imageSrc: string, pixelCrop: any): Promise<Blob | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/jpeg')
  })
}