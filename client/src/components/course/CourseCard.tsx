import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Course, Enrollment } from "@shared/schema";

interface CourseCardProps {
  course: Course;
  enrollment?: Enrollment;
  notes?: number;
}

export default function CourseCard({ course, enrollment, notes = 0 }: CourseCardProps) {
  // Get instructor initials
  const getInstructorInitials = (instructorName: string) => {
    return instructorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Get status badge
  const getStatusBadge = () => {
    if (!enrollment) return null;
    
    if (enrollment.completed) {
      return <Badge className="absolute right-3 top-3 bg-secondary">Completed</Badge>;
    } else {
      return <Badge className="absolute right-3 top-3 bg-accent">In Progress</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-40 bg-gray-200">
        {course.imageUrl ? (
          <img 
            src={course.imageUrl} 
            alt={course.title} 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <GraduationCapIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}
        {getStatusBadge()}
      </div>
      
      <CardContent className="p-4">
        <h3 className="mb-1 font-semibold text-gray-900">{course.title}</h3>
        <p className="mb-3 text-sm text-gray-500 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-gray-300 text-xs">
                {getInstructorInitials(course.instructor)}
              </AvatarFallback>
            </Avatar>
            <p className="ml-2 text-xs text-gray-600">{course.instructor}</p>
          </div>
          <div className="text-xs text-gray-600">{course.duration} weeks</div>
        </div>
        
        {enrollment && (
          <div className="mt-3 border-t pt-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">Progress: {enrollment.progress}%</div>
              <div className="text-xs font-medium text-primary">{notes} notes</div>
            </div>
            <Progress value={enrollment.progress} className="mt-1 h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// GraduationCapIcon for fallback
function GraduationCapIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
    </svg>
  );
}
