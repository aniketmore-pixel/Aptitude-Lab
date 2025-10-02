import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, ArrowLeft } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// 💡 Define a type for a quiz row, now including question count
type Quiz = {
    id: string;
    title: string;
    is_active: boolean;
    // The count property is added here for the relation query result
    question_count: number; 
};

// Define the shape of the data returned by the select query
type QuizData = {
    id: string;
    title: string;
    is_active: boolean;
    // Supabase returns the count as an array with a single object {count: number}
    questions: { count: number }[]; 
};

const QuizManagement = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQuizzes = async () => {
        setLoading(true);
        
        // 💡 FIX: Select all quiz fields and the count of related questions.
        // The foreign table name must match the actual relation in your schema, which is 'questions'.
        const { data, error } = await supabase
            .from('quizzes')
            // Select the quiz fields, and use .select('count') for the related table 'questions'
            .select('id, title, is_active, questions(count)') 
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching quizzes:', error);
            toast({
                title: "Error",
                description: "Failed to load quizzes.",
                variant: "destructive",
            });
            setQuizzes([]);
        } else {
            // 💡 Data transformation to flatten the question count into the main object
            const transformedData: Quiz[] = (data as QuizData[]).map(quiz => ({
                id: quiz.id,
                title: quiz.title,
                is_active: quiz.is_active,
                // The count is returned as an array of one element; extract the count
                question_count: quiz.questions[0]?.count || 0,
            }));
            
            setQuizzes(transformedData);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const handleEdit = (id: string) => {
        navigate(`/admin/quizzes/edit/${id}`);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete the quiz: "${title}"? This will also delete all associated questions.`)) {
            return;
        }

        const { error } = await supabase
            .from('quizzes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting quiz:', error);
            toast({ title: "Error", description: "Failed to delete quiz.", variant: "destructive" });
        } else {
            toast({ title: "Success", description: `Quiz "${title}" deleted.` });
            setQuizzes(quizzes.filter(quiz => quiz.id !== id)); // Remove from local state
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading Quizzes...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            {/* BACK BUTTON INTEGRATION */}
            <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/dashboard')} 
                className="mb-6 text-primary hover:text-primary/80"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quiz Management</h1>
                <Button onClick={() => navigate("/admin/quizzes/new")}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Quiz
                </Button>
            </div>
            
            {quizzes.length === 0 ? (
                <Card className="p-10 text-center">
                    <p className="text-lg text-muted-foreground">No quizzes found. Start by creating one!</p>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {quizzes.map((quiz) => (
                        <Card key={quiz.id} className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl flex justify-between items-center">
                                    {quiz.title}
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${quiz.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {quiz.is_active ? 'Active' : 'Draft'}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    {/* 💡 FIX: Display the actual count from the fetched data */}
                                    Questions: <span className="font-semibold text-foreground">{quiz.question_count}</span>
                                </p> 
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(quiz.id)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(quiz.id, quiz.title)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizManagement;