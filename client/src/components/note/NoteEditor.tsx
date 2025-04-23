import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Course, Note } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Image,
} from "lucide-react";

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  note?: Note;
}

export default function NoteEditor({ isOpen, onClose, note }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch courses
  const { data: courses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    enabled: isOpen,
  });

  // Set form values when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCourseId(note.courseId.toString());
      setTags(note.tags || []);
    } else {
      // Clear form for new note
      setTitle("");
      setContent("");
      setCourseId("");
      setTags([]);
    }
  }, [note, isOpen]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async () => {
      const noteData = {
        title,
        content,
        courseId: parseInt(courseId),
        tags,
      };

      if (note && note._id) {
        // Update existing note
        await apiRequest("PUT", `/api/notes/${note._id}`, noteData);
      } else {
        // Create new note
        await apiRequest("POST", "/api/notes", noteData);
      }
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", parseInt(courseId), "notes"] });
      
      // Close dialog and show toast
      onClose();
      toast({
        title: note ? "Note updated" : "Note created",
        description: note ? "Your note has been updated successfully." : "Your note has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your note. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please provide a title for your note.",
        variant: "destructive",
      });
      return;
    }
    
    if (!courseId) {
      toast({
        title: "Select a course",
        description: "Please select a course for your note.",
        variant: "destructive",
      });
      return;
    }
    
    mutation.mutate();
  };

  // Handle adding a tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handle key press for tag input
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Text editor toolbar functions
  const applyFormat = (format: string) => {
    // Simple text formatting for demo
    let wrappedText;
    const selection = window.getSelection()?.toString();
    
    if (!selection) return;
    
    switch (format) {
      case "bold":
        wrappedText = `**${selection}**`;
        break;
      case "italic":
        wrappedText = `*${selection}*`;
        break;
      case "underline":
        wrappedText = `_${selection}_`;
        break;
      case "bullet-list":
        wrappedText = `\n- ${selection}`;
        break;
      case "number-list":
        wrappedText = `\n1. ${selection}`;
        break;
      case "code":
        wrappedText = `\`${selection}\``;
        break;
      case "link":
        wrappedText = `[${selection}](url)`;
        break;
      case "image":
        wrappedText = `![${selection}](image-url)`;
        break;
      default:
        wrappedText = selection;
    }
    
    // Replace the selected text with the formatted text
    if (wrappedText) {
      setContent(content.replace(selection, wrappedText));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{note ? "Edit Note" : "Create Note"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-grow overflow-auto py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
              />
            </div>
            
            <div>
              <Label htmlFor="course">Course</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="content">Content</Label>
              <div className="border rounded-md overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 flex items-center p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 mx-0.5"
                    onClick={() => applyFormat("bold")}
                    title="Bold"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 mx-0.5"
                    onClick={() => applyFormat("italic")}
                    title="Italic"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 mx-0.5"
                    onClick={() => applyFormat("underline")}
                    title="Underline"
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                  <div className="border-r border-gray-300 h-6 mx-2"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 mx-0.5"
                    onClick={() => applyFormat("bullet-list")}
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 mx-0.5"
                    onClick={() => applyFormat("number-list")}
                    title="Numbered List"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <div className="border-r border-gray-300 h-6 mx-2"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 mx-0.5"
                    onClick={() => applyFormat("code")}
                    title="Code"
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 mx-0.5"
                    onClick={() => applyFormat("link")}
                    title="Insert Link"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0 mx-0.5"
                    onClick={() => applyFormat("image")}
                    title="Insert Image"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note here..."
                  className="min-h-[200px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex space-x-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="Add tags and press Enter"
                />
                <Button type="button" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} className="px-2 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200">
                    {tag}
                    <button
                      type="button"
                      className="ml-1 text-blue-600 hover:text-blue-800"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      &times;
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </form>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Note"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
