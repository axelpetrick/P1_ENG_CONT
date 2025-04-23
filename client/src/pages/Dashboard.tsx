import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus } from "lucide-react";
import { GraduationCap, StickyNote, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/ui/stats-card";
import CourseCard from "@/components/course/CourseCard";
import NoteCard from "@/components/note/NoteCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/auth";
import { useState } from "react";
import NoteEditor from "@/components/note/NoteEditor";
import { type Note } from "@shared/schema";

export default function Dashboard() {
  const { data: user } = useCurrentUser();
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);

  // Fetch dashboard stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch user enrollments (with courses)
  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ["/api/enrollments"],
  });

  // Fetch user notes
  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ["/api/notes"],
  });

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsNoteEditorOpen(true);
  };

  const handleCloseNoteEditor = () => {
    setSelectedNote(undefined);
    setIsNoteEditorOpen(false);
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Principal</h1>
          <p className="text-gray-600 text-sm">
            Bem-vindo de volta, {user?.firstName}!
          </p>
        </div>
        <div className="mt-4 lg:mt-0">
          <Link href="/courses">
            <Button className="flex items-center bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Participar de Novo Curso
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoadingStats ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : (
          <>
            <StatsCard
              title="Cursos Matriculados"
              value={stats?.enrolledCourses || 0}
              icon={<GraduationCap />}
              iconBgColor="bg-indigo-100"
              iconColor="text-primary"
            />
            <StatsCard
              title="Total de Anotações"
              value={stats?.totalNotes || 0}
              icon={<StickyNote />}
              iconBgColor="bg-emerald-100"
              iconColor="text-secondary"
            />
            <StatsCard
              title="Concluídos"
              value={stats?.completedCourses || 0}
              icon={<CheckCircle />}
              iconBgColor="bg-amber-100"
              iconColor="text-accent"
            />
            <StatsCard
              title="Horas Estudadas"
              value={stats?.hoursStudied || 0}
              icon={<Clock />}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-500"
            />
          </>
        )}
      </div>

      {/* Recent Courses */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Cursos Recentes</h2>
          <Link href="/courses">
            <a className="text-primary text-sm">Ver todos</a>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingEnrollments ? (
            <>
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </>
          ) : enrollments && enrollments.length > 0 ? (
            enrollments.slice(0, 3).map((enrollment) => (
              <CourseCard
                key={enrollment.id}
                course={enrollment.course}
                enrollment={enrollment}
                notes={notes?.filter((note) => note.courseId === enrollment.courseId).length || 0}
              />
            ))
          ) : (
            <p className="col-span-3 text-center py-8 text-gray-500">
              Você ainda não está matriculado em nenhum curso.{" "}
              <Link href="/courses" className="text-primary hover:underline">
                Explorar cursos
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Recent Notes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Anotações Recentes</h2>
          <Link href="/notes">
            <a className="text-primary text-sm">Ver todas</a>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoadingNotes ? (
            <>
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </>
          ) : notes && notes.length > 0 ? (
            notes.slice(0, 2).map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={handleEditNote}
              />
            ))
          ) : (
            <p className="col-span-2 text-center py-8 text-gray-500">
              Você ainda não criou nenhuma anotação.{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary hover:underline"
                onClick={() => setIsNoteEditorOpen(true)}
              >
                Criar sua primeira anotação
              </Button>
            </p>
          )}
        </div>
      </div>

      {/* Note Editor Modal */}
      <NoteEditor
        isOpen={isNoteEditorOpen}
        onClose={handleCloseNoteEditor}
        note={selectedNote}
      />
    </div>
  );
}