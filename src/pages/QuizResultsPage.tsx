import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle, XCircle, Brain, BookOpen, Clock, TrendingUp, Tag, ListChecks, ArrowLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// --- UPDATED TYPES ---
type DetailedAnswer = {
    question_id: string;
    question_text: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    quiz_section_name: string; 
    topic_name: string;
};

type QuizResult = {
    quiz_id: string;
    score: number;
    total_questions: number;
    percentage_score: number;
    completion_time: string;
    completed_at: string;
    quizzes: {
        title: string;
        description: string;
    };
    detailed_answers: DetailedAnswer[];
};

type SectionAnalysis = {
    total: number;
    correct: number;
    percentage: number;
    topicScores: Record<string, { total: number; correct: number; percentage: number }>;
};


const QuizResultsPage = () => {
    const { resultId } = useParams<{ resultId: string }>();
    const [result, setResult] = useState<QuizResult | null>(null);
    const [analysis, setAnalysis] = useState<Record<string, SectionAnalysis>>({});
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const navigate = useNavigate();
    
    // The isAdminView flag is now only used for analysis context, not navigation targeting
    const [searchParams] = useSearchParams();
    const isAdminView = searchParams.has('userId'); 

    // --- Data Fetching and Analysis (Omitted for brevity, assumed functional) ---
    useEffect(() => {
        if (!resultId) {
            navigate('/dashboard');
            return;
        }

        const fetchAndAnalyzeResult = async () => {
            setLoading(true);
            try {
                // Fetch logic remains unchanged...
                const { data, error } = await supabase
                    .from('quiz_results')
                    .select(`
                        quiz_id, score, total_questions, percentage_score, 
                        completion_time, completed_at, detailed_answers,
                        quizzes (title, description)
                    `)
                    .eq('id', resultId)
                    .maybeSingle(); 
                
                if (error || !data) {
                    throw new Error(error ? error.message : "Result not found or access denied.");
                }
                
                const fetchedResult = {
                    ...data,
                    detailed_answers: data.detailed_answers || []
                } as QuizResult;

                setResult(fetchedResult);
                
                // Perform Analysis
                const sectionalAnalysis = analyzeResults(fetchedResult.detailed_answers);
                setAnalysis(sectionalAnalysis);

            } catch (error: any) {
                console.error("Error fetching quiz result:", error);
                toast({
                    title: "Access Denied",
                    description: error.message || "Failed to load results. Ensure RLS allows viewing.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAndAnalyzeResult();
    }, [resultId, navigate, toast]);

    // --- Helper Function: Core Analysis Logic (Unchanged) ---
    const analyzeResults = (answers: DetailedAnswer[]): Record<string, SectionAnalysis> => {
        const sections: Record<string, SectionAnalysis> = {};

        answers.forEach(q => {
            const sectionName = q.quiz_section_name || 'Unassigned';
            const topicName = q.topic_name || 'General';

            sections[sectionName] = sections[sectionName] || { total: 0, correct: 0, percentage: 0, topicScores: {} };
            sections[sectionName].total += 1;
            
            sections[sectionName].topicScores[topicName] = sections[sectionName].topicScores[topicName] || { total: 0, correct: 0, percentage: 0 };
            sections[sectionName].topicScores[topicName].total += 1;

            if (q.is_correct) {
                sections[sectionName].correct += 1;
                sections[sectionName].topicScores[topicName].correct += 1;
            }
        });

        for (const sectionKey in sections) {
            const section = sections[sectionKey];
            section.percentage = parseFloat(((section.correct / section.total) * 100).toFixed(1));
            
            for (const topicKey in section.topicScores) {
                const topic = section.topicScores[topicKey];
                topic.percentage = parseFloat(((topic.correct / topic.total) * 100).toFixed(1));
            }
        }

        return sections;
    };
    
    // Helper to format interval string (e.g., "1 hour 30 minutes 15 seconds")
    const formatCompletionTime = (interval: string | null) => {
        if (!interval) return 'N/A';
        const parts = interval.split(' ');
        const timeParts = [];
        for (let i = 0; i < parts.length; i += 2) {
            timeParts.push(`${parts[i]}${parts[i + 1] ? parts[i + 1][0] : ''}`);
        }
        return timeParts.join(' ');
    };
    
    // --- Render Logic ---
    
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Brain className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-lg text-muted-foreground">Loading Report...</p>
            </div>
        );
    }

    if (!result) {
        return <div className="text-center p-10">Report not available.</div>;
    }

    const { quizzes, score, total_questions, percentage_score, completed_at, detailed_answers } = result;
    const formattedDate = new Date(completed_at).toLocaleDateString();
    
    // 💡 REMOVED backPath and backButtonText variables
    // Now using navigate(-1) directly for the browser's back functionality.

    return (
        <div className="container mx-auto py-10 max-w-4xl min-h-screen bg-muted/50">
            {/* 💡 SIMPLE BACK BUTTON using navigate(-1) */}
            <Button 
                variant="ghost" 
                onClick={() => navigate(-1)} // Navigates back one step in history
                className="mb-6 text-primary hover:text-primary/80"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            
            <Card className="shadow-2xl border-t-8 border-primary">
                <CardHeader className="text-center bg-primary/10 pt-8 pb-6">
                    <CardTitle className="text-4xl font-extrabold text-primary">
                        {quizzes.title}
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">{quizzes.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="p-8 space-y-8">
                    {/* --- 1. Global Summary Stats --- */}
                    <div className="grid grid-cols-3 gap-6 text-center border-b pb-6">
                        <div className="p-4 bg-green-50/70 rounded-lg shadow-sm">
                            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Final Score</p>
                            <p className="text-3xl font-bold text-green-700">{score}/{total_questions}</p>
                        </div>
                        <div className="p-4 bg-blue-50/70 rounded-lg shadow-sm">
                            <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Percentage</p>
                            <p className="text-3xl font-bold text-blue-700">{percentage_score}%</p>
                        </div>
                        <div className="p-4 bg-gray-50/70 rounded-lg shadow-sm">
                            <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Time Taken</p>
                            <p className="text-lg font-semibold">{formatCompletionTime(result.completion_time)}</p>
                        </div>
                    </div>

                    {/* --- 2. Sectional Analysis (Detailed Topic Scores) --- */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-2xl font-bold flex items-center">
                            <ListChecks className="h-6 w-6 mr-2 text-secondary" /> Detailed Performance Analysis
                        </h3>
                        {Object.keys(analysis).map(sectionName => {
                            const section = analysis[sectionName];
                            return (
                                <Card key={sectionName} className="border-l-4 border-secondary p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-semibold text-lg">{sectionName} 
                                            <span className="ml-2 text-sm text-muted-foreground">({section.total} Qs)</span>
                                        </h4>
                                        <span className={`text-xl font-bold ${section.percentage >= 70 ? 'text-green-600' : 'text-red-500'}`}>
                                            {section.percentage}%
                                        </span>
                                    </div>
                                    <Progress value={section.percentage} className="h-2 mb-3" />

                                    {/* Topic Scores within Section */}
                                    <p className="text-xs font-semibold text-muted-foreground mb-1 mt-3">TOPIC PERFORMANCE:</p>
                                    <div className="space-y-1">
                                        {Object.keys(section.topicScores).map(topicName => {
                                            const topic = section.topicScores[topicName];
                                            return (
                                                <div key={topicName} className="flex justify-between items-center text-sm ml-2">
                                                    <span className="flex items-center text-gray-700">
                                                        <Tag className="h-3 w-3 mr-1 text-primary/70" />{topicName}
                                                    </span>
                                                    <span className={`${topic.percentage >= 70 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                                                        {topic.correct}/{topic.total} ({topic.percentage}%)
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>


                    {/* --- 3. Question Breakdown (Details) --- */}
                    <div className="space-y-6 pt-4 border-t">
                        <h3 className="text-2xl font-bold">Question Details</h3>
                        
                        {detailed_answers?.map((q, index) => (
                            <Card 
                                key={q.question_id} 
                                className={`p-4 ${q.is_correct ? 'border-l-4 border-green-500 bg-green-50' : 'border-l-4 border-red-500 bg-red-50'}`}
                            >
                                <div className="flex items-start space-x-3">
                                    {q.is_correct ? (
                                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                                    ) : (
                                        <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                                    )}
                                    
                                    <div className="flex-grow">
                                        <p className="font-medium text-lg mb-1">
                                            Q{index + 1}: {q.question_text}
                                        </p>
                                        
                                        <div className="flex space-x-4 mb-3 text-xs text-gray-500 font-medium">
                                            <span className="flex items-center">
                                                <ListChecks className="h-3 w-3 mr-1" /> SECTION: {q.quiz_section_name || 'N/A'}
                                            </span>
                                            <span className="flex items-center">
                                                <Tag className="h-3 w-3 mr-1" /> TOPIC: {q.topic_name || 'N/A'}
                                            </span>
                                        </div>

                                        <div className="text-sm space-y-1">
                                            <p className="text-gray-700">
                                                <span className="font-semibold">Your Answer:</span> 
                                                <span className={`${q.is_correct ? 'text-green-600' : 'text-red-600'} font-medium ml-2`}>
                                                    {q.user_answer}
                                                </span>
                                            </p>

                                            {!q.is_correct && (
                                                <p className="text-green-800">
                                                    <span className="font-semibold">Correct Answer:</span>
                                                    <span className="font-medium ml-2">
                                                        {q.correct_answer}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>

                {/* CardFooter is kept clean, relying on the top button for navigation */}
                <CardFooter className="justify-center pt-6 pb-8 border-t bg-primary/5">
                </CardFooter>
            </Card>
        </div>
    );
};

export default QuizResultsPage;