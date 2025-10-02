import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
// 💡 Added ArrowLeft icon
import { Trash2, PlusCircle, ArrowLeft } from 'lucide-react'; 
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Type for Topic data
type Topic = {
    id: string;
    name: string;
};

// Type for Question data (reflecting new schema fields)
type Question = {
    id: string;
    quiz_id: string;
    question_text: string;
    options: string[]; 
    correct_answer: string;
    difficulty: number;
    // 💡 NEW SCHEMA FIELDS
    topic_id: string | null;
    quiz_section_name: string | null;
};

const QuestionForm = () => {
    const { questionId } = useParams<{ questionId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const isEditing = !!questionId;

    const query = new URLSearchParams(location.search);
    // Use the quiz ID passed from the QuizSectionManager or QuizForm
    const contextQuizId = query.get('quizId'); 
    // Use the section name passed from the QuizSectionManager for convenience
    const contextSectionName = query.get('section');

    // State
    const [questionText, setQuestionText] = useState('');
    const [options, setOptions] = useState<string[]>(['', '', '', '']);
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState('0');
    const [currentQuizId, setCurrentQuizId] = useState(contextQuizId || '');
    const [difficulty, setDifficulty] = useState<number>(1); 

    // 💡 NEW STATE: Topic and Section Management
    const [topicId, setTopicId] = useState<string>('');
    const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
    const [availableSections, setAvailableSections] = useState<string[]>([]);
    const [selectedSection, setSelectedSection] = useState<string>(contextSectionName || '');
    
    const [loading, setLoading] = useState(true);

    // --- Data Fetching ---
    useEffect(() => {
        const loadFormData = async () => {
            setLoading(true);

            if (!currentQuizId && !isEditing) {
                 // No quiz context to save to, wait for redirect/manual entry
                 setLoading(false);
                 return;
            }

            // 1. Fetch available Topics
            const { data: topicsData, error: topicsError } = await supabase
                .from('topics')
                .select('id, name')
                .order('name');
            if (!topicsError) setAvailableTopics(topicsData || []);


            // 2. Fetch Quiz Sections (from parent quiz)
            const quizToFetch = isEditing ? currentQuizId : contextQuizId;
            if (quizToFetch) {
                const { data: quizData } = await supabase
                    .from('quizzes')
                    .select('sections')
                    .eq('id', quizToFetch)
                    .maybeSingle();
                
                if (quizData?.sections) {
                    setAvailableSections(quizData.sections);
                }
            }


            // 3. Fetch existing Question data (if editing)
            if (isEditing) {
                const { data: questionData, error: qError } = await supabase
                    .from('questions')
                    .select('*, quiz_id') // Ensure quiz_id is selected for navigation
                    .eq('id', questionId)
                    .single();
                
                if (qError || !questionData) {
                    toast({ title: "Error", description: "Failed to load question data.", variant: "destructive" });
                    navigate(`/admin/quizzes/questions/${currentQuizId || '/admin/quizzes'}`);
                    setLoading(false);
                    return;
                }
                
                const question = questionData as Question;
                setQuestionText(question.question_text);
                setOptions(question.options);
                setCurrentQuizId(question.quiz_id);
                setDifficulty(question.difficulty || 1);
                
                // Set NEW SCHEMA FIELDS
                setTopicId(question.topic_id || '');
                setSelectedSection(question.quiz_section_name || '');
                
                const correctIndex = question.options.findIndex(opt => opt === question.correct_answer);
                setCorrectAnswerIndex(String(correctIndex !== -1 ? correctIndex : 0));
            }
            
            setLoading(false);
        };
        
        loadFormData();
    }, [isEditing, questionId, navigate, toast, contextQuizId]);


    // --- Option Handlers (Unchanged) ---
    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index: number) => {
        if (options.length <= 2) {
            toast({ title: "Warning", description: "A question must have at least two options.", variant: "warning" });
            return;
        }

        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
        
        let newCorrectIndex = parseInt(correctAnswerIndex);
        if (newCorrectIndex === index) {
            setCorrectAnswerIndex('0'); 
        } else if (newCorrectIndex > index) {
            setCorrectAnswerIndex(String(newCorrectIndex - 1));
        }
    };

    // --- Submission Handler ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const cleanOptions = options.filter(o => o.trim() !== '');

        if (cleanOptions.length < 2 || !selectedSection || !topicId) {
             toast({ title: "Validation Error", description: "Please provide at least two options, a Quiz Section, and a Topic.", variant: "destructive" });
             setLoading(false);
             return;
        }
        
        const correctOptionText = cleanOptions[parseInt(correctAnswerIndex)];
        
        const questionPayload = {
            quiz_id: currentQuizId, 
            question_text: questionText,
            options: cleanOptions,
            correct_answer: correctOptionText,
            difficulty: difficulty,
            // NEW SCHEMA FIELDS
            topic_id: topicId,
            quiz_section_name: selectedSection,
        };

        let result;
        
        if (isEditing) {
            result = await supabase
                .from('questions')
                .update(questionPayload)
                .eq('id', questionId);
            toast({ title: "Success", description: "Question updated successfully." });
        } else {
            result = await supabase
                .from('questions')
                .insert([questionPayload]);
            toast({ title: "Success", description: "Question created successfully." });
        }

        setLoading(false);

        if (result.error) {
            console.error('Save error:', result.error);
            toast({ title: "Error", description: `Save failed: ${result.error.message}`, variant: "destructive" });
        } else {
            // Navigate back to the dedicated Section Manager page
            navigate(`/admin/quizzes/questions/${currentQuizId}`); 
        }
    };

    const pageTitle = isEditing 
        ? 'Edit Quiz Question' 
        : (currentQuizId ? `Add Question to Quiz ${currentQuizId.substring(0, 8)}...` : 'Create New Question');

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading Question Form...</div>;
    }
    
    if (!currentQuizId && !isEditing) {
        return (
            <div className="p-8 text-center">
                <p className="text-xl text-red-500">Error: Cannot create a question without a linked Quiz ID.</p>
                <Button className="mt-4" onClick={() => navigate('/admin/quizzes')}>Go to Quiz Management</Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 max-w-3xl">
            {/* 💡 BACK BUTTON INTEGRATION */}
            <Button 
                variant="ghost" 
                // Navigate back to the Section Manager page using currentQuizId
                onClick={() => navigate(`/admin/quizzes/questions/${currentQuizId}`)} 
                className="mb-6 text-primary hover:text-primary/80"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Section Manager
            </Button>
            
            <h1 className="text-3xl font-bold mb-6">{pageTitle}</h1>
            
            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Question Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        
                        {/* Section and Topic Selectors */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* Quiz Section Selector */}
                            <div>
                                <label htmlFor="section" className="block text-sm font-medium mb-1">Assign Quiz Section</label>
                                <select 
                                    id="section" 
                                    value={selectedSection} 
                                    onChange={(e) => setSelectedSection(e.target.value)} 
                                    required
                                    className="w-full p-2 border border-input rounded-md bg-background"
                                    disabled={availableSections.length === 0}
                                >
                                    <option value="" disabled>
                                        {availableSections.length === 0 ? 'Define sections in Quiz Editor' : 'Select Section'}
                                    </option>
                                    {availableSections.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                                {availableSections.length === 0 && (
                                    <p className="text-xs text-red-500 mt-1">
                                        Define sections in Quiz Editor first.
                                    </p>
                                )}
                            </div>

                            {/* Topic Selector */}
                            <div>
                                <label htmlFor="topic" className="block text-sm font-medium mb-1">Assign Topic (for reporting)</label>
                                <select 
                                    id="topic" 
                                    value={topicId} 
                                    onChange={(e) => setTopicId(e.target.value)} 
                                    required
                                    className="w-full p-2 border border-input rounded-md bg-background"
                                    disabled={availableTopics.length === 0}
                                >
                                    <option value="" disabled>
                                        {availableTopics.length === 0 ? 'Create Topics first' : 'Select Topic'}
                                    </option>
                                    {availableTopics.map(topic => (
                                        <option key={topic.id} value={topic.id}>{topic.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Difficulty Selector */}
                        <div>
                            <label htmlFor="difficulty" className="block text-sm font-medium mb-1">Difficulty Level</label>
                            <Input 
                                id="difficulty" 
                                type="number" 
                                min="1" 
                                max="3" 
                                value={difficulty} 
                                onChange={(e) => setDifficulty(parseInt(e.target.value) || 1)} 
                                className="w-full" 
                            />
                            <p className="text-xs text-muted-foreground mt-1">1 (Easy), 2 (Medium), 3 (Hard)</p>
                        </div>
                        
                        {/* Question Text */}
                        <div>
                            <label htmlFor="questionText" className="block text-sm font-medium mb-1">Question Text</label>
                            <Textarea id="questionText" value={questionText} onChange={(e) => setQuestionText(e.target.value)} rows={3} required />
                        </div>

                        {/* Options and Radio Group (Unchanged) */}
                        <h3 className="text-lg font-semibold border-b pb-2">Options & Correct Answer (Select the correct radio button)</h3>
                        
                        <RadioGroup 
                            value={correctAnswerIndex} 
                            onValueChange={setCorrectAnswerIndex} 
                            className="space-y-4"
                        >
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg bg-secondary/10">
                                    <RadioGroupItem value={String(index)} id={`option-${index}`} />
                                    <Label htmlFor={`option-${index}`} className="flex-grow flex items-center">
                                        <span className='mr-3 text-sm font-bold text-primary'>
                                            {index + 1}.
                                        </span>
                                        <Input
                                            type="text"
                                            placeholder={`Option ${index + 1}`}
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            required
                                            className="w-full border-none focus-visible:ring-0 bg-transparent"
                                        />
                                    </Label>
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleRemoveOption(index)}
                                        disabled={options.length <= 2}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </RadioGroup>

                        <Button type="button" variant="outline" onClick={handleAddOption} className="w-full">
                            <PlusCircle className='mr-2 h-4 w-4' />
                            Add Another Option
                        </Button>
                        
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button 
                            type="submit" 
                            disabled={loading || questionText.trim() === '' || !selectedSection || !topicId}
                        >
                            {loading ? 'Saving...' : (isEditing ? 'Update Question' : 'Create Question')}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
};

export default QuestionForm;