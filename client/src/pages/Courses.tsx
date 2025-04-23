import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CourseCard from "@/components/course/CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Course } from "@shared/schema";

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Fetch user enrollments
  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ["/api/enrollments"],
  });

  // Fetch user notes
  const { data: notes } = useQuery({
    queryKey: ["/api/notes"],
  });

  // Enroll in course mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      await apiRequest("POST", `/api/courses/${courseId}/enroll`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Successfully enrolled in the course",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to enroll in the course",
        variant: "destructive",
      });
    },
  });

  // Handle enrolling in a course
  const handleEnroll = (courseId: number) => {
    enrollMutation.mutate(courseId);
  };

  // Filter courses based on search query
  const filteredCourses = courses?.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if user is enrolled in a course
  const isEnrolled = (courseId: number) => {
    return enrollments?.some((enrollment) => enrollment.courseId === courseId);
  };

  // Count notes for a course
  const getNotesCount = (courseId: number) => {
    return notes?.filter((note) => note.courseId === courseId).length || 0;
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 text-sm">
            Browse and enroll in available courses
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="pl-8 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingCourses || isLoadingEnrollments ? (
          <>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </>
        ) : filteredCourses && filteredCourses.length > 0 ? (
          filteredCourses.map((course) => {
            const enrolled = isEnrolled(course.id);
            const enrollment = enrollments?.find(
              (e) => e.courseId === course.id
            );

            return (
              <div key={course.id} className="relative">
                <CourseCard
                  course={course}
                  enrollment={enrollment}
                  notes={getNotesCount(course.id)}
                />
                {!enrolled && (
                  <Button
                    className="absolute top-2 right-2 rounded-full"
                    size="icon"
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrollMutation.isPending}
                  >
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                )}
              </div>
            );
          })
        ) : (
          <p className="col-span-3 text-center py-8 text-gray-500">
            {searchQuery
              ? "No courses match your search criteria."
              : "No courses available at the moment."}
          </p>
        )}
      </div>
    </div>
  );
}
