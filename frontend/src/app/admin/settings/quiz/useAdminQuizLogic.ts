import { useMemo, useState } from "react"
import useSWR from "swr"
import { toast } from "sonner"
import { adminApi, QuizQuestion } from "@/lib/adminApi"

export type EditorState = {
  question: string
  category: string
  difficulty: string
  options: string[]
  correctIndex: number
  points: number
  isActive: boolean
}

export const createEmptyQuestion = (): EditorState => ({
  question: "",
  category: "",
  difficulty: "Medium",
  options: ["", "", "", ""],
  correctIndex: 0,
  points: 1,
  isActive: true,
})

export const useAdminQuizLogic = () => {
  const [search, setSearch] = useState("")
  const [difficulty, setDifficulty] = useState("all")
  const [status, setStatus] = useState("all")
  const [page, setPage] = useState(1)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<QuizQuestion | null>(null)
  const [form, setForm] = useState<EditorState>(createEmptyQuestion())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const params = useMemo(
    () => ({
      page,
      limit: 20,
      search: search.trim() || undefined,
      difficulty,
      status,
    }),
    [difficulty, page, search, status]
  )

  const { data, error, isLoading, mutate } = useSWR(
    ["admin-quiz-questions", params],
    () => adminApi.quiz.getQuestions(params)
  )

  const questions = data?.data ?? []
  const pagination = data?.pagination

  const openEditor = (question?: QuizQuestion) => {
    if (question) {
      setEditing(question)
      setForm({
        question: question.question,
        category: question.category || "",
        difficulty: question.difficulty || "Medium",
        options: question.options || ["", "", "", ""],
        correctIndex: question.correctIndex ?? 0,
        points: question.points ?? 1,
        isActive: question.isActive ?? true,
      })
    } else {
      setEditing(null)
      setForm(createEmptyQuestion())
    }
    setEditorOpen(true)
  }

  const handleOptionChange = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.options]
      next[index] = value
      return { ...prev, options: next }
    })
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      if (editing) {
        await adminApi.quiz.updateQuestion(editing._id, form)
        toast.success("Question updated")
      } else {
        await adminApi.quiz.createQuestion(form)
        toast.success("Question added")
      }
      setEditorOpen(false)
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to save question")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (questionId: string) => {
    setIsSubmitting(true)
    try {
      await adminApi.quiz.deleteQuestion(questionId)
      toast.success("Question deleted")
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to delete question")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDuplicate = async (questionId: string) => {
    setIsSubmitting(true)
    try {
      await adminApi.quiz.duplicateQuestion(questionId)
      toast.success("Question duplicated")
      mutate()
    } catch (submitError: any) {
      toast.error(submitError?.message || "Unable to duplicate question")
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    search, setSearch,
    difficulty, setDifficulty,
    status, setStatus,
    page, setPage,
    editorOpen, setEditorOpen,
    editing,
    form, setForm,
    isSubmitting,
    questions,
    pagination,
    openEditor,
    handleOptionChange,
    handleSave,
    handleDelete,
    handleDuplicate,
    isLoading,
    error
  }
}
