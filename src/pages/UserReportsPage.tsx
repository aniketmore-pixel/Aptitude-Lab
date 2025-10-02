// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/hooks/use-toast";
// import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { ArrowLeft, Clock, TrendingUp, BookOpen, ChevronUp, ChevronDown, Eye } from "lucide-react";

// // Type for the results data retrieved from the database
// type UserResult = {
//     id: string;
//     quiz_id: string;
//     score: number;
//     total_questions: number;
//     percentage_score: number;
//     completed_at: string;
//     quizzes: {
//         title: string;
//         description: string;
//     };
// };

// const UserReportsPage = () => {
//     const [results, setResults] = useState<UserResult[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [sortBy, setSortBy] = useState<'completed_at' | 'percentage_score'>('completed_at');
//     const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    
//     const navigate = useNavigate();
//     const { toast } = useToast();

//     // --- Data Fetching ---
//     const fetchUserResults = async () => {
//         setLoading(true);
//         try {
//             const { data: { session } } = await supabase.auth.getSession();
//             if (!session) {
//                 navigate("/auth?mode=login");
//                 return;
//             }
//             const userId = session.user.id;

//             // Fetch all quiz results for the current user, joining to get the quiz title
//             const { data, error } = await supabase
//                 .from('quiz_results')
//                 .select(`
//                     id, quiz_id, score, total_questions, percentage_score, completed_at,
//                     quizzes (title, description)
//                 `)
//                 .eq('user_id', userId)
//                 .order('completed_at', { ascending: false });

//             if (error) throw error;

//             setResults(data as UserResult[]);

//         } catch (error: any) {
//             console.error("Error fetching user reports:", error);
//             toast({
//                 title: "Data Error",
//                 description: "Could not load your quiz history. Please check your connection.",
//                 variant: "destructive"
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchUserResults();
//     }, []);
    
//     // --- Sorting Logic ---
//     const handleSort = (key: 'completed_at' | 'percentage_score') => {
//         if (sortBy === key) {
//             setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
//         } else {
//             setSortBy(key);
//             setSortDirection('desc'); // Default to descending for new sort
//         }
//     };

//     const sortedResults = [...results].sort((a, b) => {
//         let comparison = 0;
        
//         if (sortBy === 'completed_at') {
//             const dateA = new Date(a.completed_at).getTime();
//             const dateB = new Date(b.completed_at).getTime();
//             comparison = dateA - dateB;
//         } else if (sortBy === 'percentage_score') {
//             comparison = a.percentage_score - b.percentage_score;
//         }

//         return sortDirection === 'asc' ? comparison : -comparison;
//     });

//     if (loading) {
//         return <div className="p-8 text-center text-muted-foreground">Loading Your Quiz History...</div>;
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-b from-background to-muted pt-8">
//             <div className="container mx-auto px-4 py-4">
//                 <Button variant="ghost" onClick={() => navigate('/user/dashboard')} className="mb-6">
//                     <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
//                 </Button>

//                 <Card className="shadow-2xl">
//                     <CardHeader>
//                         <CardTitle className="text-3xl font-bold flex items-center">
//                             <Clock className="h-6 w-6 mr-2 text-primary" /> My Quiz History
//                         </CardTitle>
//                         <CardDescription>
//                             Review all your past quiz attempts, scores, and detailed reports.
//                         </CardDescription>
//                     </CardHeader>
                    
//                     <CardContent className="p-0">
//                         {sortedResults.length === 0 ? (
//                             <div className="p-12 text-center text-muted-foreground">
//                                 <h4 className="text-xl font-semibold mb-2">No Results Found</h4>
//                                 <p>You haven't completed any quizzes yet. Go to the dashboard to start learning!</p>
//                             </div>
//                         ) : (
//                             <div className="overflow-x-auto">
//                                 <Table>
//                                     <TableHeader>
//                                         <TableRow>
//                                             <TableHead>Quiz Name</TableHead>
                                            
//                                             <TableHead 
//                                                 className="cursor-pointer hover:bg-muted/70"
//                                                 onClick={() => handleSort('completed_at')}
//                                             >
//                                                 <div className="flex items-center space-x-1">
//                                                     <span>Completed On</span>
//                                                     {sortBy === 'completed_at' && (
//                                                         sortDirection === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
//                                                     )}
//                                                 </div>
//                                             </TableHead>

//                                             <TableHead 
//                                                 className="cursor-pointer text-center hover:bg-muted/70"
//                                                 onClick={() => handleSort('percentage_score')}
//                                             >
//                                                 <div className="flex items-center justify-center space-x-1">
//                                                     <TrendingUp className="h-4 w-4" />
//                                                     <span>Score (%)</span>
//                                                     {sortBy === 'percentage_score' && (
//                                                         sortDirection === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
//                                                     )}
//                                                 </div>
//                                             </TableHead>

//                                             <TableHead className="text-center">Action</TableHead>
//                                         </TableRow>
//                                     </TableHeader>
                                    
//                                     <TableBody>
//                                         {sortedResults.map((result) => (
//                                             <TableRow key={result.id}>
//                                                 <TableCell className="font-medium">
//                                                     {result.quizzes?.title || 'Unknown Quiz'}
//                                                 </TableCell>
                                                
//                                                 <TableCell>
//                                                     {new Date(result.completed_at).toLocaleDateString()}
//                                                 </TableCell>
                                                
//                                                 <TableCell className={`text-center font-bold ${result.percentage_score >= 70 ? 'text-green-600' : 'text-red-500'}`}>
//                                                     {result.percentage_score}%
//                                                 </TableCell>

//                                                 <TableCell className="text-center">
//                                                     <Button 
//                                                         size="sm" 
//                                                         variant="secondary" 
//                                                         onClick={() => navigate(`/quiz/results/${result.id}`)}
//                                                     >
//                                                         <Eye className="h-4 w-4 mr-1" /> View Report
//                                                     </Button>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ))}
//                                     </TableBody>
//                                 </Table>
//                             </div>
//                         )}
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     );
// };

// export default UserReportsPage;



import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // 💡 Import useSearchParams
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, TrendingUp, BookOpen, ChevronUp, ChevronDown, Eye } from "lucide-react";

// Type for the results data retrieved from the database
type UserResult = {
    id: string;
    quiz_id: string;
    score: number;
    total_questions: number;
    percentage_score: number;
    completed_at: string;
    quizzes: {
        title: string;
        description: string;
    };
};

const UserReportsPage = () => {
    // 💡 NEW: Use search params to check for an admin-provided user ID
    const [searchParams] = useSearchParams();
    const targetUserId = searchParams.get('userId'); 
    
    const [results, setResults] = useState<UserResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState<'completed_at' | 'percentage_score'>('completed_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [targetUserEmail, setTargetUserEmail] = useState(''); // To display in header if admin view
    
    const navigate = useNavigate();
    const { toast } = useToast();

    // --- Data Fetching ---
    const fetchUserResults = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate("/auth?mode=login");
                return;
            }
            
            // 💡 Determine which user ID to fetch results for: 
            // If targetUserId is set (from admin link), use it. Otherwise, use the session user.
            const userIdToFetch = targetUserId || session.user.id;
            
            // If the user ID to fetch is DIFFERENT from the session user ID, 
            // we are in the Admin Drill-down view.
            const isAdminDrilldown = targetUserId && (targetUserId !== session.user.id);


            // 1. Fetch Target User's Email (for Admin View header)
            if (isAdminDrilldown) {
                 // Assumes you have RLS policy on 'profiles' allowing admins to see all
                 const { data: profileData } = await supabase
                     .from('profiles')
                     .select('email')
                     .eq('id', userIdToFetch)
                     .maybeSingle();
                 
                 setTargetUserEmail(profileData?.email || 'N/A');
            }


            // 2. Fetch results for the determined user
            const { data, error } = await supabase
                .from('quiz_results')
                .select(`
                    id, quiz_id, score, total_questions, percentage_score, completed_at,
                    quizzes (title, description)
                `)
                // 💡 Filtering by the conditionally determined ID
                .eq('user_id', userIdToFetch) 
                .order('completed_at', { ascending: false });

            if (error) throw error;

            setResults(data as UserResult[]);

        } catch (error: any) {
            console.error("Error fetching user reports:", error);
            toast({
                title: "Data Error",
                description: "Could not load quiz history. Check RLS policies.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // 💡 Dependency array includes targetUserId so admin view updates correctly
    useEffect(() => {
        fetchUserResults();
    }, [targetUserId]); 
    
    // --- Sorting Logic ---
    const handleSort = (key: 'completed_at' | 'percentage_score') => {
        if (sortBy === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortDirection('desc'); // Default to descending for new sort
        }
    };

    const sortedResults = [...results].sort((a, b) => {
        let comparison = 0;
        
        if (sortBy === 'completed_at') {
            const dateA = new Date(a.completed_at).getTime();
            const dateB = new Date(b.completed_at).getTime();
            comparison = dateA - dateB;
        } else if (sortBy === 'percentage_score') {
            comparison = a.percentage_score - b.percentage_score;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    // --- Render Logic ---
    
    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading Your Quiz History...</div>;
    }

    // 💡 Determine back path based on whether we are in admin drilldown
    const backPath = targetUserId ? '/admin/reports' : '/user/dashboard';
    const pageTitle = targetUserId ? `History for: ${targetUserEmail}` : 'My Quiz History';


    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted pt-8">
            <div className="container mx-auto px-4 py-4">
                <Button variant="ghost" onClick={() => navigate(backPath)} className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to {targetUserId ? 'Admin Reports' : 'Dashboard'}
                </Button>

                <Card className="shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold flex items-center">
                            <Clock className="h-6 w-6 mr-2 text-primary" /> {pageTitle}
                        </CardTitle>
                        <CardDescription>
                            Review all {targetUserId ? `${targetUserEmail}'s` : 'your'} past quiz attempts and detailed reports.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        {sortedResults.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">
                                <h4 className="text-xl font-semibold mb-2">No Results Found</h4>
                                <p>{targetUserId ? 'This user has not completed any quizzes.' : 'You haven\'t completed any quizzes yet.'}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Quiz Name</TableHead>
                                            
                                            <TableHead 
                                                className="cursor-pointer hover:bg-muted/70"
                                                onClick={() => handleSort('completed_at')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <span>Completed On</span>
                                                    {sortBy === 'completed_at' && (
                                                        sortDirection === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </TableHead>

                                            <TableHead 
                                                className="cursor-pointer text-center hover:bg-muted/70"
                                                onClick={() => handleSort('percentage_score')}
                                            >
                                                <div className="flex items-center justify-center space-x-1">
                                                    <TrendingUp className="h-4 w-4" />
                                                    <span>Score (%)</span>
                                                    {sortBy === 'percentage_score' && (
                                                        sortDirection === 'desc' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                                                    )}
                                                </div>
                                            </TableHead>

                                            <TableHead className="text-center">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    
                                    <TableBody>
                                        {sortedResults.map((result) => (
                                            <TableRow key={result.id}>
                                                <TableCell className="font-medium">
                                                    {result.quizzes?.title || 'Unknown Quiz'}
                                                </TableCell>
                                                
                                                <TableCell>
                                                    {new Date(result.completed_at).toLocaleDateString()}
                                                </TableCell>
                                                
                                                <TableCell className={`text-center font-bold ${result.percentage_score >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {result.percentage_score}%
                                                </TableCell>

                                                <TableCell className="text-center">
                                                    <Button 
                                                        size="sm" 
                                                        variant="secondary" 
                                                        onClick={() => navigate(`/quiz/results/${result.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" /> View Report
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserReportsPage;