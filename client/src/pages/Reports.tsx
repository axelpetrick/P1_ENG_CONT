import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, CheckCircle, BookMarked, FileText } from "lucide-react";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export default function Reports() {
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

  // Prepare data for pie chart
  const preparePieChartData = () => {
    if (!enrollments) return [];
    
    const completed = enrollments.filter(e => e.completed).length;
    const inProgress = enrollments.length - completed;
    
    return [
      { name: 'Completed', value: completed },
      { name: 'In Progress', value: inProgress },
    ];
  };

  // Prepare data for bar chart
  const prepareBarChartData = () => {
    if (!enrollments || !notes) return [];
    
    return enrollments.map(enrollment => {
      const courseNotes = notes.filter(note => note.courseId === enrollment.courseId).length;
      
      return {
        name: enrollment.course.title.length > 15 
          ? enrollment.course.title.substring(0, 15) + '...' 
          : enrollment.course.title,
        notes: courseNotes,
        progress: enrollment.progress,
      };
    });
  };

  // Colors for charts
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Course Progress</TabsTrigger>
          <TabsTrigger value="notes">Notes Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {isLoadingStats ? (
              <>
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-primary">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">Enrolled Courses</p>
                        <p className="text-2xl font-bold text-gray-800">{stats?.enrolledCourses || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-secondary">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">Total Notes</p>
                        <p className="text-2xl font-bold text-gray-800">{stats?.totalNotes || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-accent">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">Completed Courses</p>
                        <p className="text-2xl font-bold text-gray-800">{stats?.completedCourses || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm text-gray-500">Hours Studied</p>
                        <p className="text-2xl font-bold text-gray-800">{stats?.hoursStudied || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Completion Status</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingEnrollments ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={preparePieChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {preparePieChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} courses`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Course Progress & Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingEnrollments || isLoadingNotes ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareBarChartData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" scale="band" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="progress" name="Progress (%)" fill="#4F46E5" />
                      <Bar dataKey="notes" name="Number of Notes" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Course Progress Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingEnrollments ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : enrollments && enrollments.length > 0 ? (
                <div className="space-y-6">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <BookMarked className="h-5 w-5 text-primary mr-2" />
                          <h3 className="font-medium">{enrollment.course.title}</h3>
                        </div>
                        <span className={`text-sm ${enrollment.completed ? 'text-secondary' : 'text-accent'}`}>
                          {enrollment.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Progress: {enrollment.progress}%</span>
                        <span>Duration: {enrollment.course.duration} weeks</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  You are not enrolled in any courses yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notes Distribution by Course</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingNotes || isLoadingEnrollments ? (
                  <Skeleton className="h-64 w-full" />
                ) : notes && notes.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={enrollments?.map(enrollment => ({
                          name: enrollment.course.title.length > 20 
                            ? enrollment.course.title.substring(0, 20) + '...' 
                            : enrollment.course.title,
                          value: notes.filter(note => note.courseId === enrollment.courseId).length
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => 
                          percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {enrollments?.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} notes`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    You haven't created any notes yet.
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notes Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingNotes ? (
                  <Skeleton className="h-64 w-full" />
                ) : notes && notes.length > 0 ? (
                  <div className="space-y-6 pt-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Total Notes</h3>
                      <p className="text-3xl font-bold">{notes.length}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Notes by Tag</h3>
                      <div className="space-y-3">
                        {Array.from(
                          new Set(notes.flatMap(note => note.tags || []))
                        ).map((tag, index) => {
                          const tagCount = notes.filter(note => 
                            note.tags && note.tags.includes(tag)
                          ).length;
                          const percentage = (tagCount / notes.length) * 100;
                          
                          return (
                            <div key={index}>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{tag}</span>
                                <span>{tagCount} notes ({percentage.toFixed(1)}%)</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Average Notes per Course</h3>
                      <p className="text-3xl font-bold">
                        {enrollments && enrollments.length > 0
                          ? (notes.length / enrollments.length).toFixed(1)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    You haven't created any notes yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
