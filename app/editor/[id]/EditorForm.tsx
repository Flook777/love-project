'use client'

import { useState } from "react"
import { useForm, useFieldArray, Controller, FormProvider, useFormContext } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { updateProject, uploadImage } from "@/app/actions"

// --- Schema ---
const QuizSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'date', 'choice']),
  question: z.string(),
  answer: z.string(),
  options: z.array(z.string()),
  explanationImage: z.string().optional(),
  explanationText: z.string().optional(),
})

const FormSchema = z.object({
  name: z.string().min(1, "ชื่อโปรเจกต์ต้องใส่"),
  slug: z.string().min(3, "Slug ต้องมีอย่างน้อย 3 ตัว").regex(/^[a-z0-9-]+$/, "ใช้ได้แค่ a-z, 0-9 และ -"),
  isPublished: z.boolean(),
  customData: z.object({
    coverTitle: z.string(),
    imageUrl: z.string(),
    message: z.string(),
    useTypingEffect: z.boolean(),
    gallery: z.array(z.string()),
    themeColor: z.string(),
    fontStyle: z.string(),
    anniversaryDate: z.string(),
    bgMusicUrl: z.string(),
    musicStart: z.string(),
    musicEnd: z.string(),
    quizzes: z.array(QuizSchema),
  }),
})

type FormValues = z.infer<typeof FormSchema>

interface Project {
  id: string
  name: string
  slug: string
  isPublished: boolean
  templateId: string
  customData: Record<string, unknown> | null
}

const input = "w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition"

export default function EditorForm({ project }: { project: Project }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  const cd = (project.customData ?? {}) as Record<string, unknown>

  const methods = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      name: project.name,
      slug: project.slug,
      isPublished: project.isPublished,
      customData: {
        coverTitle: (cd.coverTitle as string) ?? "",
        imageUrl: (cd.imageUrl as string) ?? "",
        message: (cd.message as string) ?? "",
        useTypingEffect: (cd.useTypingEffect as boolean) ?? false,
        gallery: (cd.gallery as string[]) ?? [],
        themeColor: (cd.themeColor as string) ?? "#ec4899",
        fontStyle: (cd.fontStyle as string) ?? "font-sans",
        anniversaryDate: (cd.anniversaryDate as string) ?? "",
        bgMusicUrl: (cd.bgMusicUrl as string) ?? "",
        musicStart: (cd.musicStart as string) ?? "",
        musicEnd: (cd.musicEnd as string) ?? "",
        quizzes: (cd.quizzes as FormValues['customData']['quizzes']) ?? [],
      }
    }
  })

  const { register, control, handleSubmit, setValue, watch, formState: { errors, isDirty } } = methods

  const gallery = watch("customData.gallery")
  const themeColor = watch("customData.themeColor") ?? "#ec4899"

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const result = await updateProject(project.id, data)
      if (result.error) {
        setSaveError(typeof result.error === 'string' ? result.error : "Validation ไม่ผ่าน")
      } else {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
        router.refresh()
      }
    } catch {
      setSaveError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpload = async (file: File, onSuccess: (url: string) => void) => {
    const fd = new FormData()
    fd.append("file", file)
    const res = await uploadImage(fd)
    if (res.success && res.url) {
      onSuccess(res.url)
    } else {
      alert(res.error ?? "อัปโหลดไม่สำเร็จ")
    }
  }

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <form onSubmit={handleSubmit(onSubmit as never)}>

          {/* Sticky Header */}
          <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-pink-100 shadow-sm">
            <div className="max-w-3xl mx-auto px-6 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← กลับ</Link>
                <span className="text-gray-300">|</span>
                <h2 className="text-base font-bold text-gray-700 truncate max-w-[200px]">{watch("name")}</h2>
              </div>
              <div className="flex items-center gap-3">
                {saveSuccess && <span className="text-green-500 text-sm animate-pulse">บันทึกแล้ว ✓</span>}
                {saveError && <span className="text-red-500 text-sm">{saveError}</span>}
                <Link
                  href={`/p/${watch("slug")}`}
                  target="_blank"
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition"
                >
                  👁️ Preview
                </Link>
                <button
                  type="submit"
                  disabled={isSaving || !isDirty}
                  className={`px-5 py-2 rounded-lg font-bold text-sm transition ${
                    isSaving ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : isDirty ? "bg-pink-500 hover:bg-pink-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">

            {/* ── Section 1: ข้อมูลพื้นฐาน ── */}
            <Section title="📋 ข้อมูลพื้นฐาน">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="ชื่อโปรเจกต์ (ใช้ใน Dashboard)" error={errors.name?.message}>
                  <input {...register("name")} className={input} placeholder="วันครบรอบของเรา" />
                </Field>
                <Field label="URL Slug (/p/...)" error={errors.slug?.message}>
                  <input {...register("slug")} className={`${input} font-mono text-sm`} placeholder="our-anniversary" />
                </Field>
              </div>
              <label className="flex items-center gap-3 cursor-pointer mt-1">
                <Controller
                  control={control}
                  name="isPublished"
                  render={({ field }) => (
                    <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)}
                      className="w-5 h-5 rounded accent-pink-500" />
                  )}
                />
                <span className="text-sm font-medium text-gray-700">เผยแพร่ (ให้คนอื่นเข้าดูได้)</span>
              </label>
            </Section>

            {/* ── Section 2: ธีมและหน้าปก ── */}
            <Section title="🎨 ธีมและหน้าปก">
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="ชื่อที่แสดงบนหน้าปก">
                  <input {...register("customData.coverTitle")} className={input} placeholder="Happy Anniversary 💖" />
                </Field>
                <Field label="สีธีม">
                  <div className="flex items-center gap-3">
                    <Controller
                      control={control}
                      name="customData.themeColor"
                      render={({ field }) => (
                        <input type="color" value={field.value ?? "#ec4899"} onChange={e => field.onChange(e.target.value)}
                          className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
                      )}
                    />
                    <span className="text-sm font-mono text-gray-500">{themeColor}</span>
                  </div>
                </Field>
                <Field label="ฟอนต์">
                  <select {...register("customData.fontStyle")} className={input}>
                    <option value="font-sans">Sans Serif (ทั่วไป)</option>
                    <option value="font-serif">Serif (คลาสสิก)</option>
                    <option value="font-mono">Monospace</option>
                  </select>
                </Field>
                <Field label="วันที่เริ่มคบ (นับวัน)">
                  <input type="date" {...register("customData.anniversaryDate")} className={input} />
                </Field>
              </div>
              <Field label="รูปหน้าปก">
                <ImageUploader
                  currentUrl={watch("customData.imageUrl") ?? ""}
                  fieldKey="coverImage"
                  uploadingField={uploadingField}
                  setUploadingField={setUploadingField}
                  onUpload={(file) => handleUpload(file, (url) => setValue("customData.imageUrl", url, { shouldDirty: true }))}
                  onRemove={() => setValue("customData.imageUrl", "", { shouldDirty: true })}
                />
              </Field>
            </Section>

            {/* ── Section 3: ข้อความ ── */}
            <Section title="💌 ข้อความในซอง">
              <Field label="ข้อความหลัก (จดหมายความรัก)">
                <textarea
                  {...register("customData.message")}
                  className={`${input} min-h-[160px] resize-y`}
                  placeholder="เขียนบอกรักได้เลยเลย..."
                />
              </Field>
              <label className="flex items-center gap-3 cursor-pointer">
                <Controller
                  control={control}
                  name="customData.useTypingEffect"
                  render={({ field }) => (
                    <input type="checkbox" checked={field.value ?? false} onChange={e => field.onChange(e.target.checked)}
                      className="w-5 h-5 rounded accent-pink-500" />
                  )}
                />
                <span className="text-sm text-gray-700">แสดงข้อความแบบ Typewriter (พิมพ์ทีละตัว)</span>
              </label>
            </Section>

            {/* ── Section 4: เพลง ── */}
            <Section title="🎵 เพลงประกอบ">
              <Field label="ลิงก์เพลง (YouTube, Spotify, SoundCloud, หรือ URL ตรง)">
                <input
                  {...register("customData.bgMusicUrl")}
                  className={input}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="เริ่มเล่นที่วินาทีที่ (YouTube)">
                  <input type="number" {...register("customData.musicStart")} className={input} placeholder="0" min="0" />
                </Field>
                <Field label="หยุดที่วินาทีที่ (0 = เล่นจนจบ)">
                  <input type="number" {...register("customData.musicEnd")} className={input} placeholder="0" min="0" />
                </Field>
              </div>
            </Section>

            {/* ── Section 5: แกลเลอรี่ ── */}
            <Section title="📸 แกลเลอรี่รูปภาพ">
              <div className="grid grid-cols-3 gap-3">
                {gallery.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                    <Image src={url} alt={`gallery-${idx}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setValue("customData.gallery", gallery.filter((_, i) => i !== idx), { shouldDirty: true })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                <label className={`border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-pink-400 transition aspect-square text-gray-400 text-sm ${uploadingField === 'gallery' ? 'opacity-50' : ''}`}>
                  {uploadingField === 'gallery' ? '⏳' : '+ เพิ่มรูป'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingField === 'gallery'}
                    onChange={async (e) => {
                      if (!e.target.files?.[0]) return
                      setUploadingField('gallery')
                      await handleUpload(e.target.files[0], (url) => {
                        setValue("customData.gallery", [...gallery, url], { shouldDirty: true })
                      })
                      setUploadingField(null)
                    }}
                  />
                </label>
              </div>
            </Section>

            {/* ── Section 6: Quiz ── */}
            <QuizSection
              uploadingField={uploadingField}
              setUploadingField={setUploadingField}
              handleUpload={handleUpload}
            />

          </div>
        </form>
      </div>
    </FormProvider>
  )
}

// --- QuizSection uses useFormContext to avoid prop-passing type issues ---
function QuizSection({
  uploadingField,
  setUploadingField,
  handleUpload,
}: {
  uploadingField: string | null
  setUploadingField: (v: string | null) => void
  handleUpload: (file: File, onSuccess: (url: string) => void) => Promise<void>
}) {
  const { control, register, watch, setValue } = useFormContext<FormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: "customData.quizzes" })

  const addQuiz = () => {
    append({
      id: Date.now().toString(),
      type: 'text',
      question: '',
      answer: '',
      options: ['', '', '', ''],
      explanationImage: '',
      explanationText: '',
    })
  }

  return (
    <Section title="🤔 Quiz / Mini-game">
      <p className="text-sm text-gray-500 mb-4">ตั้งคำถามให้คนรับต้องตอบก่อนดูเซอร์ไพรส์ (จะกี่ข้อก็ได้)</p>

      {fields.map((field, index) => {
        const quizType = watch(`customData.quizzes.${index}.type`)
        const explanationImage = watch(`customData.quizzes.${index}.explanationImage`) ?? ""

        return (
          <div key={field.id} className="border border-gray-200 rounded-xl p-4 space-y-3 mb-4 relative">
            <button type="button" onClick={() => remove(index)}
              className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition text-lg leading-none">✕</button>
            <p className="font-semibold text-gray-600 text-sm">คำถามข้อที่ {index + 1}</p>

            <div className="grid md:grid-cols-2 gap-3">
              <Field label="คำถาม">
                <input {...register(`customData.quizzes.${index}.question`)} className={input} placeholder="ครั้งแรกที่เราเจอกันอยู่ที่ไหน?" />
              </Field>
              <Field label="ประเภทคำตอบ">
                <Controller
                  control={control}
                  name={`customData.quizzes.${index}.type`}
                  render={({ field }) => (
                    <select value={field.value} onChange={e => field.onChange(e.target.value)} className={input}>
                      <option value="text">พิมพ์ตอบ (ข้อความ)</option>
                      <option value="date">เลือกวันที่</option>
                      <option value="choice">ตัวเลือก (4 ตัว)</option>
                    </select>
                  )}
                />
              </Field>
              <Field label="คำตอบที่ถูก">
                <input {...register(`customData.quizzes.${index}.answer`)} className={input} placeholder="คำตอบที่ถูกต้อง" />
              </Field>
            </div>

            {quizType === 'choice' && (
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map(i => (
                  <Field key={i} label={`ตัวเลือกที่ ${i + 1}`}>
                    <input {...register(`customData.quizzes.${index}.options.${i}`)} className={input} placeholder={`ตัวเลือก ${i + 1}`} />
                  </Field>
                ))}
              </div>
            )}

            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-500 mb-2">หน้าเฉลย (แสดงหลังตอบถูก)</p>
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="ข้อความเฉลย">
                  <input {...register(`customData.quizzes.${index}.explanationText`)} className={input} placeholder="เก่งมากเลยที่รัก! 💖" />
                </Field>
                <Field label="รูปเฉลย">
                  <ImageUploader
                    currentUrl={explanationImage}
                    fieldKey={`quiz-${index}-img`}
                    uploadingField={uploadingField}
                    setUploadingField={setUploadingField}
                    onUpload={(file) => handleUpload(file, (url) => setValue(`customData.quizzes.${index}.explanationImage`, url, { shouldDirty: true }))}
                    onRemove={() => setValue(`customData.quizzes.${index}.explanationImage`, "", { shouldDirty: true })}
                  />
                </Field>
              </div>
            </div>
          </div>
        )
      })}

      <button
        type="button"
        onClick={addQuiz}
        className="w-full py-3 border-2 border-dashed border-pink-300 rounded-xl text-pink-500 hover:border-pink-500 hover:bg-pink-50 transition font-medium text-sm"
      >
        + เพิ่มคำถาม
      </button>
    </Section>
  )
}

// --- Shared sub-components ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-pink-50 overflow-hidden">
      <div className="px-6 py-4 border-b border-pink-50 bg-pink-50/50">
        <h3 className="font-bold text-gray-700">{title}</h3>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  )
}

function ImageUploader({
  currentUrl, fieldKey, uploadingField, setUploadingField, onUpload, onRemove
}: {
  currentUrl: string
  fieldKey: string
  uploadingField: string | null
  setUploadingField: (v: string | null) => void
  onUpload: (file: File) => Promise<void>
  onRemove: () => void
}) {
  const isUploading = uploadingField === fieldKey
  return (
    <div className="flex items-center gap-4">
      {currentUrl ? (
        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group flex-shrink-0">
          <Image src={currentUrl} alt="preview" fill className="object-cover" />
          <button type="button" onClick={onRemove}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
            ลบ
          </button>
        </div>
      ) : (
        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-3xl flex-shrink-0">🖼️</div>
      )}
      <label className={`px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer transition ${isUploading ? 'bg-gray-100 text-gray-400' : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'}`}>
        {isUploading ? '⏳ กำลังอัปโหลด...' : 'เลือกรูปภาพ'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={isUploading}
          onChange={async (e) => {
            if (!e.target.files?.[0]) return
            setUploadingField(fieldKey)
            await onUpload(e.target.files[0])
            setUploadingField(null)
          }}
        />
      </label>
    </div>
  )
}
