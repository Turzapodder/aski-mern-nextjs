"use client"

import { Copy, Pencil, Plus, Trash2 } from "lucide-react"

import { QuizQuestion } from "@/lib/adminApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useAdminQuizLogic } from "./useAdminQuizLogic"

export const AdminQuizClient = () => {
  const {
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
  } = useAdminQuizLogic();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Quiz question bank</h1>
          <p className="text-sm text-gray-500">Manage onboarding assessment questions.</p>
        </div>
        <Button onClick={() => openEditor()}>
          <Plus className="h-4 w-4" />
          Add question
        </Button>
      </div>

      <Card className="border border-gray-200/70 bg-white/90 shadow-sm">
        <CardHeader className="space-y-4">
          <CardTitle className="text-base font-semibold">Questions</CardTitle>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search questions"
              className="md:w-72"
            />
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="sm:w-44">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="sm:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Unable to load questions.
            </div>
          )}

          {!isLoading && !error && questions.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No questions found.
            </div>
          )}

          {!isLoading && !error && questions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="py-3 pr-4">Question</th>
                    <th className="py-3 pr-4">Category</th>
                    <th className="py-3 pr-4">Difficulty</th>
                    <th className="py-3 pr-4">Active</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {questions.map((question: QuizQuestion) => (
                    <tr key={question._id} className="hover:bg-gray-50/60">
                      <td className="py-3 pr-4 text-gray-700">{question.question}</td>
                      <td className="py-3 pr-4 text-gray-600">{question.category || "N/A"}</td>
                      <td className="py-3 pr-4 text-gray-600">{question.difficulty}</td>
                      <td className="py-3 pr-4 text-gray-600">{question.isActive ? "Yes" : "No"}</td>
                      <td className="py-3 text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditor(question)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDuplicate(question._id)}>
                          <Copy className="h-3.5 w-3.5" />
                          Duplicate
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(question._id)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && pagination && pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
               <span>
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </button>
                <button
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:opacity-50"
                  onClick={() => setPage((prev) => Math.min(pagination.pages, prev + 1))}
                  disabled={pagination.page >= pagination.pages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit question" : "Add question"}</DialogTitle>
            <DialogDescription>Provide a multiple choice question with 4 options.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={form.question}
              onChange={(event) => setForm((prev) => ({ ...prev, question: event.target.value }))}
              placeholder="Question text"
              rows={3}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                placeholder="Category"
              />
              <Select
                value={form.difficulty}
                onValueChange={(value) => setForm((prev) => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {form.options.map((option, index) => (
                <Input
                  key={index}
                  value={option}
                  onChange={(event) => handleOptionChange(index, event.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Input
                value={form.correctIndex}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, correctIndex: Number(event.target.value) }))
                }
                placeholder="Correct index (0-3)"
              />
              <Input
                value={form.points}
                onChange={(event) => setForm((prev) => ({ ...prev, points: Number(event.target.value) }))}
                placeholder="Points"
              />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(value) => setForm((prev) => ({ ...prev, isActive: value }))}
                />
                Active
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setEditorOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save question"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
