import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
// 💡 Added FileText, TrendingDown (for weakness) icons
import { Brain, LogOut, TrendingUp, Target, Calendar, PlayCircle, FileText, TrendingDown } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";

// Define a type for a quiz and user stats
type Quiz = {
    id: string;
    title: string;
    description: string;
};

type UserStats = {
    totalQuizzesTaken: number;
    averageScore: number; // 0-100
    currentStreak: number;
};

// Helper function for a simplified streak calculation (Re-pasted for context)
const calculateStreak = (completionDates: string[]): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueDates = Array.from(new Set(
        completionDates.map(dateString => new Date(dateString).toDateString())
    ));
    
    if (uniqueDates.length === 0) return 0;

    let streak = 0;
    let checkDate = new Date(today);

    if (uniqueDates.includes(checkDate.toDateString())) {
        streak = 1;
    } else {
        checkDate.setDate(checkDate.getDate() - 1);
        if (uniqueDates.includes(checkDate.toDateString())) {
            streak = 1;
        } else {
            return 0;
        }
    }

    for (let i = 1; i <= uniqueDates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        if (uniqueDates.includes(checkDate.toDateString())) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
};


const UserDashboard = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();

    // State for data
    const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
    const [stats, setStats] = useState<UserStats>({
        totalQuizzesTaken: 0,
        averageScore: 0,
        currentStreak: 0,
    });
    // ---


    const fetchDashboardData = async (userId: string) => {
        try {
            // 1. Fetch Available Quizzes (Active only)
            const { data: quizzesData, error: quizzesError } = await supabase
                .from('quizzes')
                .select('id, title, description')
                .eq('is_active', true)
                .order('created_at', { ascending: true });

            if (!quizzesError) {
                setAvailableQuizzes(quizzesData as Quiz[]);
            }

            // 2. Fetch User Stats (Using quiz_results/quiz_attempts based on your schema logic)
            // Note: Using the original 'quiz_results' fetch for now, assuming external fix to read from quiz_attempts is not yet universal.
            const { data: resultsData, error: resultsError } = await supabase
                .from('quiz_results')
                .select('score, total_questions, completed_at')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false }); // Latest first

            if (!resultsError && resultsData && resultsData.length > 0) {
                
                // Calculate Average Score
                const totalPercentage = resultsData.reduce((sum, result) => {
                    const percentage = (result.score / result.total_questions) * 100;
                    return sum + percentage;
                }, 0);

                const avgScore = totalPercentage / resultsData.length;

                // Calculate Streak
                const streak = calculateStreak(resultsData.map(r => r.completed_at));

                setStats({
                    totalQuizzesTaken: resultsData.length,
                    averageScore: parseFloat(avgScore.toFixed(1)),
                    currentStreak: streak
                });
            } else {
                setStats(prev => ({ ...prev, totalQuizzesTaken: 0, averageScore: 0, currentStreak: 0 }));
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast({
                title: "Data Error",
                description: "Could not fetch quizzes or stats. Check RLS policies.",
                variant: "destructive"
            });
        }
    };
    
    // --- Authentication and Initialization ---
    useEffect(() => {
        const getUserAndData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                navigate("/auth?mode=login");
                setLoading(false);
                return;
            }

            setUser(session.user);
            
            // Fetch data after user is confirmed
            await fetchDashboardData(session.user.id);
            
            setLoading(false);
        };

        getUserAndData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!session) {
                    navigate("/auth?mode=login");
                } else {
                    setUser(session.user);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast({
            title: "Signed out",
            description: "You've been successfully signed out.",
        });
        navigate("/");
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <Brain className="mx-auto mb-4 h-12 w-12 animate-pulse text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
                            <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">AptitudeLab</h1>
                            <p className="text-xs text-muted-foreground">User Dashboard</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium">{user?.email}</p>
                            <p className="text-xs text-muted-foreground">Student</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="mb-2 text-3xl font-bold">Welcome back, {user?.email}!</h2>
                    <p className="text-muted-foreground">
                        Continue your learning journey and track your progress
                    </p>
                </div>

                {/* Quick Stats & Reports Card - Set to 4 columns for consistent layout */}
                <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    
                    {/* Stat Card 1: Quizzes Taken */}
                    <Card className="border-border/50 bg-card p-6">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Quizzes Taken</h3>
                            <Target className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-3xl font-bold">{stats.totalQuizzesTaken}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{stats.totalQuizzesTaken > 0 ? "Keep up the great work!" : "Start your first quiz"}</p>
                    </Card>

                    {/* Stat Card 2: Average Score */}
                    <Card className="border-border/50 bg-card p-6">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Average Score</h3>
                            <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        <p className="text-3xl font-bold">{stats.averageScore}%</p>
                        <p className="mt-1 text-xs text-muted-foreground">{stats.totalQuizzesTaken > 0 ? "Your current performance average" : "Take quizzes to see stats"}</p>
                    </Card>

                    {/* Stat Card 3: Current Streak */}
                    <Card className="border-border/50 bg-card p-6">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
                            <Calendar className="h-5 w-5 text-yellow-500" />
                        </div>
                        <p className="text-3xl font-bold">{stats.currentStreak} days</p>
                        <p className="mt-1 text-xs text-muted-foreground">{stats.currentStreak > 0 ? "You're consistent! 🔥" : "Practice daily to build streak"}</p>
                    </Card>
                    
                    {/* 💡 NEW CARD: Weakness Analysis */}
                    <Card 
                        className="group cursor-pointer border-l-4 border-red-500 bg-card p-6 transition-all hover:shadow-lg"
                        onClick={() => navigate('/user/weakness')}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Personalized</h3>
                            <TrendingDown className="h-5 w-5 text-red-500 transition-transform group-hover:scale-110" />
                        </div>
                        <p className="text-3xl font-bold">Weakness</p>
                        <p className="mt-1 text-xs text-muted-foreground">Identify and attack your weakest topics.</p>
                    </Card>

                    {/* Original Reports Card (Adjusted to fit 4-column layout if necessary) */}
                    <Card 
                        className="group cursor-pointer border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
                        onClick={() => navigate('/user/reports')}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Past Results</h3>
                            <FileText className="h-5 w-5 text-accent" />
                        </div>
                        <p className="text-3xl font-bold">History</p>
                        <p className="mt-1 text-xs text-muted-foreground">View all past quiz attempts and reports</p>
                    </Card>
                </div>

                {/* Available Quizzes Section */}
                <Card className="border-border/50 bg-card p-8">
                    <h3 className="mb-6 text-2xl font-bold border-b pb-2">Available Quizzes</h3>
                    
                    {availableQuizzes.length === 0 ? (
                        <div className="text-center py-10">
                            <Brain className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
                            <h4 className="mb-2 text-xl font-semibold">No Quizzes Available Yet</h4>
                            <p className="mb-6 text-muted-foreground">
                                Quizzes will appear here once the administrator creates them. Check back soon!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {availableQuizzes.map(quiz => (
                                <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div>
                                        <p className="text-lg font-semibold">{quiz.title}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{quiz.description}</p>
                                    </div>
                                    <Button onClick={() => navigate(`/quiz/${quiz.id}`)}>
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                        Start Quiz
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </main>
        </div>
    );
};

export default UserDashboard;