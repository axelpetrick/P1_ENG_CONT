import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Tag, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NoteCard from "@/components/note/NoteCard";
import NoteEditor from "@/components/note/NoteEditor";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Note } from "@shared/schema";

export default function Notes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | undefined>();

  // Fetch user notes
  const { data: notes, isLoading: isLoadingNotes } = useQuery({
    queryKey: ["/api/notes"],
  });

  // Fetch user enrollments (for course filtering)
  const { data: enrollments } = useQuery({
    queryKey: ["/api/enrollments"],
  });

  // Handle opening note editor for a new note
  const handleNewNote = () => {
    setSelectedNote(undefined);
    setIsNoteEditorOpen(true);
  };

  // Handle editing an existing note
  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsNoteEditorOpen(true);
  };

  // Handle closing the note editor
  const handleCloseNoteEditor = () => {
    setIsNoteEditorOpen(false);
    setSelectedNote(undefined);
  };

  // Get all unique tags from notes
  const allTags = notes
    ? Array.from(
        new Set(
          notes.flatMap((note) => (note.tags ? note.tags : []))
        )
      ).sort()
    : [];

  // Filter notes based on search query, selected course, and selected tag
  const filteredNotes = notes
    ? notes.filter((note) => {
        const matchesSearch =
          searchQuery === "" ||
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCourse =
          selectedCourse === "all" ||
          note.courseId.toString() === selectedCourse;

        const matchesTag =
          selectedTag === "all" ||
          (note.tags && note.tags.includes(selectedTag));

        return matchesSearch && matchesCourse && matchesTag;
      })
    : [];

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
          <p className="text-gray-600 text-sm">
            Manage and organize your course notes
          </p>
        </div>

        <Button className="flex items-center" onClick={handleNewNote}>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search notes..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-500" />
            <Select
              value={selectedCourse}
              onValueChange={setSelectedCourse}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {enrollments?.map((enrollment) => (
                  <SelectItem
                    key={enrollment.courseId}
                    value={enrollment.courseId.toString()}
                  >
                    {enrollment.course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-500" />
            <Select
              value={selectedTag}
              onValueChange={setSelectedTag}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoadingNotes ? (
          <>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </>
        ) : filteredNotes.length > 0 ? (
          filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={handleEditNote}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <StickyNote className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No notes found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {notes && notes.length > 0
                ? "Try adjusting your filters or search term."
                : "Get started by creating a new note."}
            </p>
            <div className="mt-6">
              <Button onClick={handleNewNote}>
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Button>
            </div>
          </div>
        )}
      </div>

      <NoteEditor
        isOpen={isNoteEditorOpen}
        onClose={handleCloseNoteEditor}
        note={selectedNote}
      />
    </div>
  );
}

function StickyNote(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
      <path d="M15 3v6h6" />
    </svg>
  );
}
