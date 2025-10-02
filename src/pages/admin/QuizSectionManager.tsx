// import { useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
// import { PlusCircle, Edit, Trash2, ArrowLeft, Tag, FileQuestion, ChevronDown, ChevronUp } from "lucide-react";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/hooks/use-toast";

// type Question = {
//     id: string;
//     question_text: string;
//     quiz_section_name: string;
//     topic_id: string | null;
//     // The joined object is now explicitly named 'topics' (plural) to match the query.
//     topics: { name: string } | null; 
// };

// type QuizDetails = {
//     title: string;
//     sections: string[];
// };

// const QuizSectionManager = () => {
//     const { quizId } = useParams<{ quizId: string }>();
//     const navigate = useNavigate();
//     const { toast } = useToast();
    
//     const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
//     const [questions, setQuestions] = useState<Question[]>([]);
//     const [loading, setLoading] = useState(true);
    
//     const [openSection, setOpenSection] = useState<string | null>(null);

//     // --- Data Fetching ---
//     const fetchQuizData = useCallback(async () => {
//         setLoading(true);
//         if (!quizId) {
//             toast({ title: "Error", description: "Quiz ID is missing.", variant: "destructive" });
//             navigate('/admin/quizzes');
//             return;
//         }

//         try {
//             // 1. Fetch Quiz Details
//             const { data: quizData, error: quizError } = await supabase
//                 .from('quizzes')
//                 .select('title, sections')
//                 .eq('id', quizId)
//                 .maybeSingle();

//             if (quizError || !quizData) throw new Error("Quiz not found or failed to load sections.");
//             setQuizDetails(quizData as QuizDetails);
            
//             if (quizData.sections && quizData.sections.length > 0 && !openSection) {
//                  setOpenSection(quizData.sections[0]);
//             }


//             // 2. Fetch all questions, using the explicit constraint name for the join.
//             const { data: questionsData, error: questionsError } = await supabase
//                 .from('questions')
//                 // 💡 FINAL FIX: Use the explicit constraint name (Table!Constraint(columns))
//                 .select(`
//                     id, 
//                     question_text, 
//                     quiz_section_name, 
//                     topic_id, 
//                     topics!questions_topic_id_fkey(name) 
//                 `) 
//                 .eq('quiz_id', quizId)
//                 .order('quiz_section_name', { ascending: true });
            
//             if (questionsError) throw new Error(`Failed to load questions. Supabase error: ${questionsError.message}`);
            
//             setQuestions(questionsData as Question[] || []);

//         } catch (error: any) {
//             console.error("Fetch error:", error);
//             // This toast will now display the accurate Supabase error if the RLS on 'topics' or another issue exists
//             toast({ title: "Error", description: error.message || "Failed to load quiz data.", variant: "destructive" });
//             navigate('/admin/quizzes');
//         } finally {
//             setLoading(false);
//         }
//     }, [quizId, navigate, toast, openSection]);

//     useEffect(() => {
//         fetchQuizData();
//     }, [fetchQuizData]);


//     // --- Handlers (Unchanged) ---
    
//     const handleAddQuestion = (sectionName: string) => {
//         navigate(`/admin/questions/new?quizId=${quizId}&section=${sectionName}`);
//     };

//     const handleEditQuestion = (questionId: string) => {
//         navigate(`/admin/questions/edit/${questionId}?quizId=${quizId}`);
//     };

//     const handleDeleteQuestion = async (questionId: string, text: string) => {
//         if (!window.confirm(`Are you sure you want to delete the question: "${text.substring(0, 30)}..."?`)) return;

//         const { error } = await supabase.from('questions').delete().eq('id', questionId);

//         if (error) {
//             toast({ title: "Error", description: `Failed to delete question: ${error.message}`, variant: "destructive" });
//         } else {
//             toast({ title: "Success", description: "Question deleted successfully." });
//             fetchQuizData(); // Refresh the list
//         }
//     };

//     const handleDeleteSection = async (sectionName: string) => {
//         if (!window.confirm(`WARNING: Deleting the '${sectionName}' section will remove it from the quiz structure and clear the section assignment for all associated questions. Proceed?`)) return;

//         const newSections = quizDetails!.sections.filter(s => s !== sectionName);
        
//         const { error: quizUpdateError } = await supabase
//             .from('quizzes')
//             .update({ sections: newSections })
//             .eq('id', quizId);

//         if (quizUpdateError) {
//             toast({ title: "Error", description: `Failed to remove section: ${quizUpdateError.message}`, variant: "destructive" });
//             return;
//         }

//         const { error: questionUpdateError } = await supabase
//             .from('questions')
//             .update({ quiz_section_name: null })
//             .eq('quiz_id', quizId)
//             .eq('quiz_section_name', sectionName);

//         if (questionUpdateError) {
//              console.error("Failed to clear question assignments:", questionUpdateError);
//         }

//         toast({ title: "Success", description: `Section '${sectionName}' removed and questions unassigned.` });
//         fetchQuizData();
//     };

//     // --- Rendering Logic ---
//     if (loading) {
//         return <div className="p-8 text-center text-muted-foreground">Loading Quiz Sections and Questions...</div>;
//     }

//     const sections = quizDetails?.sections || [];
    
//     // Group questions by section name
//     const questionsBySection = questions.reduce((acc, q) => {
//         const sectionName = q.quiz_section_name || 'Unassigned Questions'; 
//         acc[sectionName] = acc[sectionName] || [];
//         acc[sectionName].push(q);
//         return acc;
//     }, {} as Record<string, Question[]>);


//     return (
//         <div className="container mx-auto py-8">
//             <Button variant="ghost" onClick={() => navigate(`/admin/quizzes/edit/${quizId}`)} className="mb-4">
//                 <ArrowLeft className="h-4 w-4 mr-2" /> Back to Quiz Editor
//             </Button>

//             <Card className="shadow-lg">
//                 <CardHeader className="bg-primary/10">
//                     <CardTitle className="text-3xl font-bold text-primary">
//                         Manage Questions for: {quizDetails?.title || 'Quiz'}
//                     </CardTitle>
//                     <CardDescription className="text-lg">
//                         Define questions for the {sections.length} sections of this quiz.
//                     </CardDescription>
//                 </CardHeader>

//                 <CardContent className="p-6 space-y-6">
//                     {sections.length === 0 ? (
//                             <div className="p-8 text-center border border-dashed rounded-lg bg-red-50 text-red-700">
//                                 <p className="font-semibold mb-2">Quiz sections are not defined.</p>
//                                 <p>Please go back to the Quiz Editor to define sections like 'Quantitative' or 'Reasoning'.</p>
//                             </div>
//                     ) : (
//                         sections.map(sectionName => (
//                             <Card key={sectionName} className="border-secondary/50">
//                                 <CardHeader 
//                                     className="bg-secondary/10 cursor-pointer flex flex-row items-center justify-between"
//                                     onClick={() => setOpenSection(openSection === sectionName ? null : sectionName)}
//                                 >
//                                     <div className="flex items-center space-x-3">
//                                         <Tag className="h-5 w-5 text-secondary" />
//                                         <CardTitle className="text-xl">
//                                             {sectionName}
//                                             <span className="text-sm font-normal text-muted-foreground ml-3">
//                                                 ({questionsBySection[sectionName]?.length || 0} Questions)
//                                             </span>
//                                         </CardTitle>
//                                     </div>
//                                     <div className="flex items-center space-x-2">
//                                         <Button 
//                                             variant="outline" 
//                                             size="icon" 
//                                             onClick={(e) => { e.stopPropagation(); handleDeleteSection(sectionName); }}
//                                             className="text-red-500 hover:bg-red-100"
//                                             title={`Delete section ${sectionName}`}
//                                         >
//                                             <Trash2 className="h-4 w-4" />
//                                         </Button>
//                                         {openSection === sectionName ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
//                                     </div>
//                                 </CardHeader>
                                
//                                 {openSection === sectionName && (
//                                     <CardContent className="p-4 border-t space-y-3">
//                                         <Button onClick={() => handleAddQuestion(sectionName)} size="sm">
//                                             <PlusCircle className="h-4 w-4 mr-2" /> Add New Question to {sectionName}
//                                         </Button>

//                                         {(questionsBySection[sectionName] || []).map((q, qIndex) => (
//                                             <div key={q.id} className="flex justify-between items-start p-3 border rounded-md bg-white">
//                                                 <div className="flex-grow pr-4">
//                                                     <p className="font-semibold text-sm mb-1">Q{qIndex + 1}: {q.question_text}</p>
//                                                     {/* Display Topic Name */}
//                                                     {q.topics?.name && ( 
//                                                          <span className="text-xs text-muted-foreground flex items-center">
//                                                              <Tag className="h-3 w-3 mr-1" /> Topic: {q.topics.name}
//                                                          </span>
//                                                     )}
//                                                 </div>
//                                                 <div className="flex space-x-2 flex-shrink-0">
//                                                     <Button variant="outline" size="icon" onClick={() => handleEditQuestion(q.id)}>
//                                                         <Edit className="h-4 w-4" />
//                                                     </Button>
//                                                     <Button variant="destructive" size="icon" onClick={() => handleDeleteQuestion(q.id, q.question_text)}>
//                                                         <Trash2 className="h-4 w-4" />
//                                                     </Button>
//                                                 </div>
//                                             </div>
//                                         ))}

//                                         {(questionsBySection[sectionName]?.length === 0) && (
//                                             <p className="text-muted-foreground text-sm p-4 text-center">No questions assigned to this section yet.</p>
//                                         )}
//                                     </CardContent>
//                                 )}
//                             </Card>
//                         ))
//                     )}
                    
//                     {/* Unassigned Questions Section */}
//                     {questionsBySection['Unassigned Questions'] && questionsBySection['Unassigned Questions'].length > 0 && (
//                         <Card className="border-yellow-500 bg-yellow-50">
//                             <CardHeader 
//                                 className="bg-yellow-100 cursor-pointer flex flex-row items-center justify-between"
//                                 onClick={() => setOpenSection(openSection === 'Unassigned Questions' ? null : 'Unassigned Questions')}
//                             >
//                                 <div className="flex items-center space-x-3">
//                                     <FileQuestion className="h-5 w-5 text-yellow-600" />
//                                     <CardTitle className="text-xl text-yellow-800">
//                                         Unassigned Questions
//                                         <span className="text-sm font-normal text-yellow-600 ml-3">
//                                             ({questionsBySection['Unassigned Questions'].length} Total)
//                                         </span>
//                                     </CardTitle>
//                                 </div>
//                                 {openSection === 'Unassigned Questions' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
//                             </CardHeader>
                            
//                             {openSection === 'Unassigned Questions' && (
//                                 <CardContent className="p-4 border-t space-y-3">
//                                     {(questionsBySection['Unassigned Questions'] || []).map((q, qIndex) => (
//                                         <div key={q.id} className="flex justify-between items-start p-3 border rounded-md bg-white">
//                                             <div className="flex-grow pr-4">
//                                                 <p className="font-semibold text-sm mb-1">Q{qIndex + 1}: {q.question_text}</p>
//                                                 {q.topics?.name && ( 
//                                                     <span className="text-xs text-muted-foreground flex items-center">
//                                                         <Tag className="h-3 w-3 mr-1" /> Topic: {q.topics.name}
//                                                     </span>
//                                                 )}
//                                             </div>
//                                             <div className="flex space-x-2 flex-shrink-0">
//                                                 <Button variant="outline" size="icon" onClick={() => handleEditQuestion(q.id)}>
//                                                     <Edit className="h-4 w-4" />
//                                                 </Button>
//                                                 <Button variant="destructive" size="icon" onClick={() => handleDeleteQuestion(q.id, q.question_text)}>
//                                                     <Trash2 className="h-4 w-4" />
//                                                 </Button>
//                                             </div>
//                                         </div>
//                                     ))}
//                                     {/* Link to Quiz Editor to assign to a section */}
//                                     <p className="text-muted-foreground text-sm p-2 text-center border-t pt-3">
//                                         Edit questions to assign them to a section above.
//                                     </p>
//                                 </CardContent>
//                             )}
//                         </Card>
//                     )}
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

// export default QuizSectionManager;


import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, ArrowLeft, Tag, FileQuestion, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Question = {
    id: string;
    question_text: string;
    quiz_section_name: string;
    topic_id: string | null;
    topics: { name: string } | null; 
};

type QuizDetails = {
    title: string;
    sections: string[];
};

const QuizSectionManager = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [openSection, setOpenSection] = useState<string | null>(null);

    // --- Data Fetching ---
    // 💡 FIX: Removed openSection from the dependency array. 
    // It only controls UI, not the data fetched.
    const fetchQuizData = useCallback(async () => {
        setLoading(true);
        if (!quizId) {
            toast({ title: "Error", description: "Quiz ID is missing.", variant: "destructive" });
            navigate('/admin/quizzes');
            return;
        }

        try {
            // 1. Fetch Quiz Details
            const { data: quizData, error: quizError } = await supabase
                .from('quizzes')
                .select('title, sections')
                .eq('id', quizId)
                .maybeSingle();

            if (quizError || !quizData) throw new Error("Quiz not found or failed to load sections.");
            setQuizDetails(quizData as QuizDetails);
            
            // Set first section open by default if it exists (only if no section is already open)
            if (quizData.sections && quizData.sections.length > 0 && openSection === null) {
                 setOpenSection(quizData.sections[0]);
            }


            // 2. Fetch all questions, using the explicit constraint name for the join.
            const { data: questionsData, error: questionsError } = await supabase
                .from('questions')
                .select(`id, question_text, quiz_section_name, topic_id, topics!questions_topic_id_fkey(name)`) 
                .eq('quiz_id', quizId)
                .order('quiz_section_name', { ascending: true });
            
            if (questionsError) throw new Error(`Failed to load questions. Supabase error: ${questionsError.message}`);
            
            setQuestions(questionsData as Question[] || []);

        } catch (error: any) {
            console.error("Fetch error:", error);
            toast({ title: "Error", description: error.message || "Failed to load quiz data.", variant: "destructive" });
            navigate('/admin/quizzes');
        } finally {
            setLoading(false);
        }
    }, [quizId, navigate, toast]); // 💡 openSection has been removed from here.

    useEffect(() => {
        // 💡 FIX: The effect now runs only when fetchQuizData or its core dependencies change.
        fetchQuizData();
    }, [fetchQuizData]);


    // --- Handlers (Unchanged) ---
    
    const handleAddQuestion = (sectionName: string) => {
        navigate(`/admin/questions/new?quizId=${quizId}&section=${sectionName}`);
    };

    const handleEditQuestion = (questionId: string) => {
        navigate(`/admin/questions/edit/${questionId}?quizId=${quizId}`);
    };

    const handleDeleteQuestion = async (questionId: string, text: string) => {
        if (!window.confirm(`Are you sure you want to delete the question: "${text.substring(0, 30)}..."?`)) return;

        const { error } = await supabase.from('questions').delete().eq('id', questionId);

        if (error) {
            toast({ title: "Error", description: `Failed to delete question: ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Question deleted successfully." });
            fetchQuizData(); // Refresh the list
        }
    };

    const handleDeleteSection = async (sectionName: string) => {
        if (!window.confirm(`WARNING: Deleting the '${sectionName}' section will remove it from the quiz structure and clear the section assignment for all associated questions. Proceed?`)) return;

        const newSections = quizDetails!.sections.filter(s => s !== sectionName);
        
        const { error: quizUpdateError } = await supabase
            .from('quizzes')
            .update({ sections: newSections })
            .eq('id', quizId);

        if (quizUpdateError) {
            toast({ title: "Error", description: `Failed to remove section: ${quizUpdateError.message}`, variant: "destructive" });
            return;
        }

        const { error: questionUpdateError } = await supabase
            .from('questions')
            .update({ quiz_section_name: null })
            .eq('quiz_id', quizId)
            .eq('quiz_section_name', sectionName);

        if (questionUpdateError) {
             console.error("Failed to clear question assignments:", questionUpdateError);
        }

        toast({ title: "Success", description: `Section '${sectionName}' removed and questions unassigned.` });
        fetchQuizData();
    };

    // --- Rendering Logic ---
    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading Quiz Sections and Questions...</div>;
    }

    const sections = quizDetails?.sections || [];
    
    // Group questions by section name
    const questionsBySection = questions.reduce((acc, q) => {
        const sectionName = q.quiz_section_name || 'Unassigned Questions'; 
        acc[sectionName] = acc[sectionName] || [];
        acc[sectionName].push(q);
        return acc;
    }, {} as Record<string, Question[]>);


    return (
        <div className="container mx-auto py-8">
            <Button variant="ghost" onClick={() => navigate(`/admin/quizzes/edit/${quizId}`)} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Quiz Editor
            </Button>

            <Card className="shadow-lg">
                <CardHeader className="bg-primary/10">
                    <CardTitle className="text-3xl font-bold text-primary">
                        Manage Questions for: {quizDetails?.title || 'Quiz'}
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Define questions for the {sections.length} sections of this quiz.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {sections.length === 0 ? (
                            <div className="p-8 text-center border border-dashed rounded-lg bg-red-50 text-red-700">
                                <p className="font-semibold mb-2">Quiz sections are not defined.</p>
                                <p>Please go back to the Quiz Editor to define sections like 'Quantitative' or 'Reasoning'.</p>
                            </div>
                    ) : (
                        sections.map(sectionName => (
                            <Card key={sectionName} className="border-secondary/50">
                                <CardHeader 
                                    className="bg-secondary/10 cursor-pointer flex flex-row items-center justify-between"
                                    onClick={() => setOpenSection(openSection === sectionName ? null : sectionName)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Tag className="h-5 w-5 text-secondary" />
                                        <CardTitle className="text-xl">
                                            {sectionName}
                                            <span className="text-sm font-normal text-muted-foreground ml-3">
                                                ({questionsBySection[sectionName]?.length || 0} Questions)
                                            </span>
                                        </CardTitle>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button 
                                            variant="outline" 
                                            size="icon" 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteSection(sectionName); }}
                                            className="text-red-500 hover:bg-red-100"
                                            title={`Delete section ${sectionName}`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        {openSection === sectionName ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                    </div>
                                </CardHeader>
                                
                                {openSection === sectionName && (
                                    <CardContent className="p-4 border-t space-y-3">
                                        <Button onClick={() => handleAddQuestion(sectionName)} size="sm">
                                            <PlusCircle className="h-4 w-4 mr-2" /> Add New Question to {sectionName}
                                        </Button>

                                        {(questionsBySection[sectionName] || []).map((q, qIndex) => (
                                            <div key={q.id} className="flex justify-between items-start p-3 border rounded-md bg-white">
                                                <div className="flex-grow pr-4">
                                                    <p className="font-semibold text-sm mb-1">Q{qIndex + 1}: {q.question_text}</p>
                                                    {/* Display Topic Name */}
                                                    {q.topics?.name && ( 
                                                         <span className="text-xs text-muted-foreground flex items-center">
                                                             <Tag className="h-3 w-3 mr-1" /> Topic: {q.topics.name}
                                                         </span>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2 flex-shrink-0">
                                                    <Button variant="outline" size="icon" onClick={() => handleEditQuestion(q.id)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteQuestion(q.id, q.question_text)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}

                                        {(questionsBySection[sectionName]?.length === 0) && (
                                            <p className="text-muted-foreground text-sm p-4 text-center">No questions assigned to this section yet.</p>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        ))
                    )}
                    
                    {/* Unassigned Questions Section */}
                    {questionsBySection['Unassigned Questions'] && questionsBySection['Unassigned Questions'].length > 0 && (
                        <Card className="border-yellow-500 bg-yellow-50">
                            <CardHeader 
                                className="bg-yellow-100 cursor-pointer flex flex-row items-center justify-between"
                                onClick={() => setOpenSection(openSection === 'Unassigned Questions' ? null : 'Unassigned Questions')}
                            >
                                <div className="flex items-center space-x-3">
                                    <FileQuestion className="h-5 w-5 text-yellow-600" />
                                    <CardTitle className="text-xl text-yellow-800">
                                        Unassigned Questions
                                        <span className="text-sm font-normal text-yellow-600 ml-3">
                                            ({questionsBySection['Unassigned Questions'].length} Total)
                                        </span>
                                    </CardTitle>
                                </div>
                                {openSection === 'Unassigned Questions' ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </CardHeader>
                            
                            {openSection === 'Unassigned Questions' && (
                                <CardContent className="p-4 border-t space-y-3">
                                    {(questionsBySection['Unassigned Questions'] || []).map((q, qIndex) => (
                                        <div key={q.id} className="flex justify-between items-start p-3 border rounded-md bg-white">
                                            <div className="flex-grow pr-4">
                                                <p className="font-semibold text-sm mb-1">Q{qIndex + 1}: {q.question_text}</p>
                                                {q.topics?.name && ( 
                                                    <span className="text-xs text-muted-foreground flex items-center">
                                                        <Tag className="h-3 w-3 mr-1" /> Topic: {q.topics.name}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex space-x-2 flex-shrink-0">
                                                <Button variant="outline" size="icon" onClick={() => handleEditQuestion(q.id)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="destructive" size="icon" onClick={() => handleDeleteQuestion(q.id, q.question_text)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Link to Quiz Editor to assign to a section */}
                                    <p className="text-muted-foreground text-sm p-2 text-center border-t pt-3">
                                        Edit questions to assign them to a section above.
                                    </p>
                                </CardContent>
                            )}
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default QuizSectionManager;