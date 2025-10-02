import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Brain, LogOut, FileQuestion, BookOpen, BarChart3, Users, Tag } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();

    // State for fetched data
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [activeQuizzes, setActiveQuizzes] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    // 💡 Renaming to better reflect the new metric
    const [avgPlatformScore, setAvgPlatformScore] = useState(0); 

    // Helper to get distinct user count (carried over from previous fixes)
    const getDistinctUsersWithResults = async () => {
        const { data, error } = await supabase.from("quiz_results").select("user_id");
        if (error) return 0;
        return new Set(data?.map(item => item.user_id)).size;
    };


    const fetchDashboardStats = async () => {
        try {
            // 1. Total Questions
            const { count: questionsCount, error: qError } = await supabase
                .from("questions")
                .select("*", { count: "exact", head: true });
            
            if (!qError) setTotalQuestions(questionsCount || 0);

            // 2. Active Quizzes
            const { count: quizzesCount, error: quizError } = await supabase
                .from("quizzes")
                .select("*", { count: "exact", head: true })
                .eq("is_active", true); 
            
            if (!quizError) setActiveQuizzes(quizzesCount || 0);

            // 3. Total Users
            const userCount = await getDistinctUsersWithResults();
            setTotalUsers(userCount);
            
            // 4. 💡 NEW CALCULATION: Average Platform Score
            
            // --- Option A (Client-Side Aggregation - Safest, used here) ---
            const { data: resultsData, error: resultsError } = await supabase
                 .from("quiz_results")
                 .select("percentage_score");
            
            let calculatedAvg = 0;
            if (!resultsError && resultsData && resultsData.length > 0) {
                 const totalScoreSum = resultsData.reduce((sum, result) => sum + result.percentage_score, 0);
                 calculatedAvg = totalScoreSum / resultsData.length;
            }
            
            // Set the new state variable
            setAvgPlatformScore(parseFloat(calculatedAvg.toFixed(2)));

            // (The old "Completion Rate" state is no longer used/updated here)
            
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            toast({
                title: "Data Error",
                description: "Could not fetch dashboard statistics.",
                variant: "destructive"
            });
        }
    };


    useEffect(() => {
        const getUserAndStats = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                navigate("/auth?mode=login");
                setLoading(false);
                return;
            }

            setUser(session.user);
            
            // 💡 Admin RLS/Role Check (Carried over from Auth.tsx logic)
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', session.user.id)
                .maybeSingle();

            if (!profile?.is_admin) {
                toast({ title: "Access Denied", description: "You do not have administrative privileges.", variant: "destructive" });
                navigate("/user/dashboard");
                setLoading(false);
                return;
            }

            fetchDashboardStats();
            setLoading(false); 
        };

        getUserAndStats();

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
                            <h1 className="text-lg font-bold">Aptitude Lab</h1>
                            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="hidden text-right sm:block">
                            <p className="text-sm font-medium">{user?.email}</p>
                            <p className="text-xs text-muted-foreground">Administrator</p>
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
                    <h2 className="mb-2 text-3xl font-bold">Admin Dashboard</h2>
                    <p className="text-muted-foreground">
                        Manage questions, quizzes, and analyze results
                    </p>
                </div>

                {/* Quick Stats - 💡 UPDATED LAST CARD */}
                <div className="mb-8 grid gap-6 md:grid-cols-4">
                    <Card className="border-border/50 bg-card p-6">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Questions</h3>
                            <FileQuestion className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-3xl font-bold">{totalQuestions}</p>
                    </Card>

                    <Card className="border-border/50 bg-card p-6">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Active Quizzes</h3>
                            <BookOpen className="h-5 w-5 text-secondary" />
                        </div>
                        <p className="text-3xl font-bold">{activeQuizzes}</p>
                    </Card>

                    <Card className="border-border/50 bg-card p-6">
                        <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
                            <Users className="h-5 w-5 text-accent" />
                        </div>
                        <p className="text-3xl font-bold">{totalUsers}</p>
                    </Card>

                    <Card className="border-border/50 bg-card p-6">
                        <div className="mb-2 flex items-center justify-between">
                            {/* 💡 UPDATED TEXT */}
                            <h3 className="text-sm font-medium text-muted-foreground">Avg Platform Score</h3>
                            <BarChart3 className="h-5 w-5 text-success" />
                        </div>
                        {/* 💡 UPDATED VALUE */}
                        <p className="text-3xl font-bold">{avgPlatformScore}%</p>
                    </Card>
                </div>

                {/* Management Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="group border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                            <FileQuestion className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold">Question Management</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Organize questions by Topics for better tagging and analytical insight.
                        </p>
                        
                        <Button 
                            variant="secondary" 
                            className="w-full mb-2" 
                            onClick={() => navigate("/admin/topics")}
                        >
                            <Tag className="mr-2 h-4 w-4" /> Manage Topics
                        </Button>

                        <Button 
                            className="w-full"
                            onClick={() => navigate("/admin/questions")}
                        >
                             Manage Questions
                        </Button>
                    </Card>

                    <Card className="group cursor-pointer border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary transition-transform group-hover:scale-110">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold">Quiz Management</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Create and configure quizzes with different topics and difficulty levels
                        </p>
                        <Button className="w-full" onClick={() => navigate("/admin/quizzes")}>Manage Quizzes</Button>
                    </Card>

                    <Card className="group cursor-pointer border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-transform group-hover:scale-110">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold">Results & Analytics</h3>
                        <p className="mb-4 text-sm text-muted-foreground">
                            View detailed performance reports and category-wise analysis
                        </p>
                        <Button className="w-full" onClick={() => navigate("/admin/reports")}>View Reports</Button>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;