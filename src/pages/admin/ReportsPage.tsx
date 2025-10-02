// src/pages/Admin/ReportsPage.tsx (New File)

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Users, BookOpen, TrendingUp, LineChart, ArrowLeft } from "lucide-react"; 
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

// ... (Type definitions remain the same) ...

// --- NEW CHART UTILITY COMPONENT: Line Chart Simulation (definition omitted for brevity) ---
const QuizDistributionLineChart = ({ data }: { data: QuizDistribution[] }) => {
    // ... (Line chart logic remains here)
    if (data.length <= 1) { 
        return (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed rounded-lg text-muted-foreground p-4">
                <LineChart className="h-8 w-8 mb-2" />
                {data.length === 0 ? "No quiz data recorded yet." : "Need more quiz data to plot a trend."}
            </div>
        );
    }
    
    const sortedData = [...data].sort((a, b) => a.title.localeCompare(b.title));
    const maxAverage = 100;

    const labels = sortedData.map(d => d.title); 

    const points = sortedData.map((d, index) => ({
        x: (index / (sortedData.length - 1)) * 100, 
        y: d.average,
        attempts: d.attempts,
    }));

    const polylinePoints = points.map(p => `${p.x} ${100 - (p.y / maxAverage) * 100}`).join(" ");

    return (
        <div className="relative pt-6 overflow-x-hidden">
            <div className="h-64 w-full border border-b-2 border-l-2 border-gray-300 relative bg-gray-50">
                
                <svg className="absolute w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <polyline 
                        points={polylinePoints}
                        fill="none"
                        stroke="#3b82f6" 
                        strokeWidth="1.5"
                        style={{ strokeLinejoin: 'round', strokeLinecap: 'round' }}
                    />
                </svg>

                {points.map((point, index) => {
                    const score = point.y.toFixed(0);
                    return (
                        <div key={index} className="absolute inset-0 pointer-events-none">
                            <div
                                className="absolute w-3 h-3 rounded-full bg-primary shadow-lg ring-2 ring-white transform -translate-x-1/2 -translate-y-1/2"
                                style={{ left: `${point.x}%`, top: `${100 - (point.y / maxAverage) * 100}%` }}
                                title={`Avg Score: ${score}% | Attempts: ${point.attempts}`}
                            />
                            <span className="absolute text-xs font-bold text-primary"
                                style={{ left: `${point.x}%`, top: `${100 - (point.y / maxAverage) * 100 - 15}%`, transform: 'translateX(-50%)' }}
                            >
                                {score}%
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between mt-2 text-xs text-center text-gray-700 font-medium">
                {labels.map((label, index) => (
                    <div key={index} className="w-1/6 max-w-[100px] truncate px-1" title={label}>
                        {label.substring(0, 15)}
                    </div>
                ))}
            </div>
        </div>
    );
};
// -------------------------------------------------------------


const ReportsPage = () => {
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<UserReport[]>([]);
    const [globalStats, setGlobalStats] = useState({ totalQuizzes: 0, totalResults: 0, overallAvg: 0 });
    const [distributionData, setDistributionData] = useState<QuizDistribution[]>([]);

    const { toast } = useToast();
    const navigate = useNavigate();

    // 💡 NEW DRILLDOWN HANDLER
    const handleDrilldown = (userId: string) => {
        // Navigate to the UserReportsPage, passing the userId in the query parameter
        navigate(`/user/reports?userId=${userId}`);
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            // 1. Fetch ALL quiz results, joining with quizzes (to get title)
            const { data: results, error } = await supabase
                .from('quiz_results')
                .select(`
                    score,
                    total_questions,
                    percentage_score,
                    completed_at,
                    quiz_id,
                    quizzes (title),
                    user_id
                `)
                .order('completed_at', { ascending: false });

            if (error) throw error;

            // 2. Fetch User Emails (RPC assumption)
            const userIds = [...new Set(results.map(r => r.user_id))];
            const { data: usersData } = await supabase.rpc('get_user_emails_by_ids', { user_ids: userIds });
            const userMap = (usersData || []).reduce((acc: Record<string, string>, user: { id: string, email: string }) => {
                acc[user.id] = user.email;
                return acc;
            }, {});

            // 3. Process and Group Data
            const processedData = processReportData(results, userMap);
            setReportData(processedData.userReports);
            setGlobalStats(processedData.globalStats);
            setDistributionData(processedData.distributionData);

        } catch (error: any) {
            console.error("Error fetching reports:", error);
            toast({
                title: "Report Error",
                description: `Failed to load data: ${error.message || 'Check RLS permissions.'}`,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };
    
    const processReportData = (results: any[], userMap: Record<string, string>) => {
        const userGroups: Record<string, ReportEntry[]> = {};
        const quizAggregates: Record<string, { totalScore: number, attempts: number, title: string }> = {};
        let totalScoreSum = 0;
        let totalQuestionsSum = 0;
        const uniqueQuizzes = new Set<string>();

        results.forEach(r => {
            const entry: ReportEntry = {
                user_id: r.user_id,
                email: userMap[r.user_id] || 'Unknown User',
                quiz_title: r.quizzes?.title || 'Deleted Quiz',
                score: r.score,
                total_questions: r.total_questions,
                percentage_score: r.percentage_score,
                completed_at: r.completed_at,
            };

            userGroups[r.user_id] = userGroups[r.user_id] || [];
            userGroups[r.user_id].push(entry);
            
            const quizTitle = entry.quiz_title;
            quizAggregates[quizTitle] = quizAggregates[quizTitle] || { totalScore: 0, attempts: 0, title: quizTitle };
            quizAggregates[quizTitle].totalScore += entry.percentage_score;
            quizAggregates[quizTitle].attempts += 1;

            totalScoreSum += r.score;
            totalQuestionsSum += r.total_questions;
            uniqueQuizzes.add(r.quiz_id);
        });

        const userReports: UserReport[] = Object.values(userGroups).map(results => {
            const totalAttempts = results.length;
            const quizzesAttempted = new Set(results.map(r => r.quiz_title)).size;
            const avgScore = results.reduce((sum, r) => sum + r.percentage_score, 0) / totalAttempts;
            
            return {
                email: results[0].email,
                totalAttempts,
                quizzesAttempted,
                avgScore: parseFloat(avgScore.toFixed(1)),
                latestAttemptDate: new Date(results[0].completed_at).toLocaleDateString(),
                results: results,
            };
        });

        const distributionData: QuizDistribution[] = Object.values(quizAggregates).map(agg => ({
            title: agg.title,
            attempts: agg.attempts,
            average: parseFloat((agg.totalScore / agg.attempts).toFixed(1)),
        })).sort((a, b) => a.title.localeCompare(b.title));

        const overallAvg = totalQuestionsSum > 0 ? (totalScoreSum / totalQuestionsSum) * 100 : 0;

        return {
            userReports: userReports.sort((a, b) => b.latestAttemptDate.localeCompare(a.latestAttemptDate)),
            globalStats: {
                totalQuizzes: uniqueQuizzes.size,
                totalResults: results.length,
                overallAvg: parseFloat(overallAvg.toFixed(1)),
            },
            distributionData: distributionData,
        };
    };
    
    // --- Lifecycle ---
    useEffect(() => {
        fetchReports();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading Detailed Reports...</div>;
    }

    // --- Render ---
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted pt-8">
            <div className="container mx-auto px-4 py-4">
                {/* 💡 BACK BUTTON INTEGRATION */}
                <Button 
                    variant="ghost" 
                    onClick={() => navigate('/admin/dashboard')} 
                    className="mb-6 text-primary hover:text-primary/80"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                </Button>

                <h1 className="text-4xl font-extrabold mb-2">Platform Analytics</h1>
                <p className="text-lg text-muted-foreground mb-8">
                    Comprehensive reports on user activity and quiz performance.
                </p>

                {/* Global Stats */}
                <div className="grid gap-6 md:grid-cols-3 mb-10">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users with Results</CardTitle>
                            <Users className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reportData.length}</div>
                            <p className="text-xs text-muted-foreground">Distinct users who completed a quiz</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Quizzes Available</CardTitle>
                            <BookOpen className="h-4 w-4 text-secondary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{globalStats.totalQuizzes}</div>
                            <p className="text-xs text-muted-foreground">{globalStats.totalResults} attempts recorded</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overall Average Score</CardTitle>
                            <TrendingUp className="h-4 w-4 text-success" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{globalStats.overallAvg}%</div>
                            <p className="text-xs text-muted-foreground">Across all recorded results</p>
                        </CardContent>
                    </Card>
                </div>

                {/* 💡 Quiz Performance Distribution CHART (Line Graph) */}
                <Card className="mb-10 p-6 shadow-xl">
                    <CardTitle className="mb-4 flex items-center text-2xl font-bold">
                        <LineChart className="h-6 w-6 mr-3 text-primary" /> Quiz Average Score Trend
                    </CardTitle>
                    <CardDescription className="mb-4">
                         Visual representation of the average score for every quiz created on the platform, sorted alphabetically by title.
                    </CardDescription>
                    {/* Render the actual chart component */}
                    <QuizDistributionLineChart data={distributionData} />
                </Card>


                {/* Detailed User Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Performance Snapshot</CardTitle>
                        <CardDescription>Detailed statistics for all users who have attempted quizzes.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User Email</TableHead>
                                    <TableHead className="text-center">Quizzes Attempted</TableHead>
                                    <TableHead className="text-center">Total Attempts</TableHead>
                                    <TableHead className="text-center">Average Score</TableHead>
                                    <TableHead className="text-center">Latest Attempt</TableHead>
                                    <TableHead>Progress</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reportData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No quiz results have been recorded yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reportData.map((userReport) => (
                                        <TableRow 
                                            key={userReport.email} 
                                            // 💡 ADD CLICK HANDLER TO ROW
                                            onClick={() => handleDrilldown(userReport.results[0].user_id)}
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                        >
                                            <TableCell className="font-medium">{userReport.email}</TableCell>
                                            <TableCell className="text-center">{userReport.quizzesAttempted}</TableCell>
                                            <TableCell className="text-center">{userReport.totalAttempts}</TableCell>
                                            <TableCell className="text-center font-bold">{userReport.avgScore}%</TableCell>
                                            <TableCell className="text-center">{userReport.latestAttemptDate}</TableCell>
                                            <TableCell>
                                                <Progress value={userReport.avgScore} className="w-full" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ReportsPage;