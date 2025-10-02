import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { PlusCircle, Clock, XCircle, ArrowRight, ArrowLeft } from 'lucide-react'; 
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const QuizForm = () => {
    const { quizId } = useParams<{ quizId: string }>(); 
    const navigate = useNavigate();
    const { toast } = useToast();
    const isEditing = !!quizId;
    
    // Core Quiz State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(false);
    
    // Time Limit State
    const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | ''>(''); 
    
    // Sections Management State
    const [sections, setSections] = useState<string[]>([]);
    const [newSection, setNewSection] = useState('');
    
    const [loading, setLoading] = useState(false);

    // --- Data Fetching (FIX APPLIED HERE) ---
    useEffect(() => {
        if (isEditing) {
            const fetchQuiz = async () => {
                setLoading(true);
                const { data, error } = await supabase
                    .from('quizzes')
                    .select('title, description, is_active, time_limit, sections') 
                    .eq('id', quizId)
                    .single();
                
                if (error || !data) {
                    toast({ title: "Error", description: "Failed to load quiz data.", variant: "destructive" });
                    navigate('/admin/quizzes');
                } else {
                    setTitle(data.title);
                    setDescription(data.description || '');
                    setIsActive(data.is_active);
                    
                    // 💡 THE FIX: Parse HH:MM:SS format into total minutes
                    let parsedTimeLimit: number | '' = '';
                    if (data.time_limit && typeof data.time_limit === 'string') {
                        const parts = data.time_limit.split(':');
                        if (parts.length === 3) {
                            const hours = parseInt(parts[0]);
                            const minutes = parseInt(parts[1]);
                            const totalMinutes = (hours * 60) + minutes;
                            
                            // Only set the state if totalMinutes is a valid, non-zero number
                            if (totalMinutes > 0) {
                                parsedTimeLimit = totalMinutes;
                            }
                        }
                    }
                    // If parsing fails, or the time is 00:00:00, it remains '' (empty input)
                    setTimeLimitMinutes(parsedTimeLimit);
                    
                    // 💡 Load existing sections (JSONB array)
                    setSections(data.sections || []); 
                }
                setLoading(false);
            };
            fetchQuiz();
        }
    }, [isEditing, quizId, navigate, toast]);

    // --- Section Management Handlers ---
    const handleAddSection = () => {
        const trimmedSection = newSection.trim();
        if (trimmedSection && !sections.includes(trimmedSection)) {
            setSections([...sections, trimmedSection]);
            setNewSection('');
        }
    };

    const handleRemoveSection = (sectionToRemove: string) => {
        setSections(sections.filter(s => s !== sectionToRemove));
    };
    // ------------------------------------


    // --- Form Submission (MINOR ADJUSTMENT) ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        const user = (await supabase.auth.getSession()).data.session?.user;

        // 💡 ADJUSTMENT: Convert the state back to the 'HH:MM:SS' string format
        const timeLimitInterval = timeLimitMinutes 
            ? `00:${String(timeLimitMinutes).padStart(2, '0')}:00` // Assumes minutes <= 99. If hours are needed, this logic needs expansion.
            : null;

        const quizPayload = { 
            title, 
            description, 
            is_active: isActive,
            time_limit: timeLimitInterval, // NOW SAVED AS '00:MM:00' or null
            sections: sections,           
            created_by: user?.id, 
        };

        let result;
        
        if (isEditing) {
            // Supabase UPDATE logic
            result = await supabase
                .from('quizzes')
                .update(quizPayload) 
                .eq('id', quizId);
            
            toast({ title: "Success", description: "Quiz updated successfully." });
        } else {
            // Supabase INSERT logic
            result = await supabase
                .from('quizzes')
                .insert([quizPayload])
                .select('id')
                .single();

            if (result.data) {
                toast({ title: "Success", description: "Quiz created. Define sections and questions next." });
                // Redirect to the edit page of the newly created quiz
                navigate(`/admin/quizzes/edit/${result.data.id}`); 
            }
        }

        if (result.error) {
            console.error('Save error:', result.error);
            toast({ title: "Error", description: `Save failed: ${result.error.message}`, variant: "destructive" });
        }

        setLoading(false);
    };

    if (loading && isEditing) {
        return <div className="p-8 text-center text-muted-foreground">Loading Quiz...</div>;
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            {/* 💡 BACK BUTTON INTEGRATION */}
            <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/quizzes')} 
                className="mb-6 text-primary hover:text-primary/80"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Quiz List
            </Button>

            <h1 className="text-3xl font-bold mb-6">{isEditing ? 'Edit Quiz' : 'Create New Quiz'}</h1>
            
            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Quiz Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Title & Description (existing) */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                        </div>

                        {/* Time Limit Input */}
                        <div>
                            <label htmlFor="timeLimit" className="block text-sm font-medium mb-1 flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                Time Limit (Minutes)
                            </label>
                            <Input 
                                id="timeLimit" 
                                type="number"
                                min="1"
                                placeholder="e.g., 60 for 60 minutes" 
                                value={timeLimitMinutes} 
                                onChange={(e) => setTimeLimitMinutes(e.target.value === '' ? '' : parseInt(e.target.value))}
                            />
                            <p className="text-xs text-muted-foreground mt-1">Leave blank for no time limit.</p>
                        </div>
                        
                        {/* Active Checkbox (existing) */}
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox id="isActive" checked={isActive} onCheckedChange={(checked) => setIsActive(!!checked)} />
                            <label htmlFor="isActive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Set as Active
                            </label>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => navigate('/admin/quizzes')} type="button">Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : (isEditing ? 'Update Quiz' : 'Create Quiz')}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {/* Sections Management Card */}
            {isEditing && (
                <Card className="mt-6 border-l-4 border-secondary">
                    <CardHeader>
                        <CardTitle>Quiz Sections Setup</CardTitle>
                        <CardDescription>Define the named sections (e.g., 'Quantitative', 'Reasoning') that structure this quiz.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex space-x-2">
                            <Input
                                placeholder="Add New Section Name"
                                value={newSection}
                                onChange={(e) => setNewSection(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSection())}
                            />
                            <Button onClick={handleAddSection} type="button" disabled={!newSection.trim()}>
                                Add
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 min-h-[40px] border p-2 rounded-md bg-background/50">
                            {sections.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No sections defined yet. Questions cannot be assigned without them.</p>
                            ) : (
                                sections.map((section, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-center bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full space-x-1"
                                    >
                                        <span>{section}</span>
                                        <button 
                                            type="button" 
                                            onClick={() => handleRemoveSection(section)} 
                                            className="ml-2 text-secondary-foreground/70 hover:text-white"
                                            title={`Remove ${section}`}
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}


            {/* Question/Section Management Redirection */}
            {isEditing && (
                <Card className="mt-6 border-l-4 border-primary">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            Question Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Proceed to the dedicated manager to assign, reorder, and review questions within the defined sections.
                        </p>
                        <Button 
                            className="w-full"
                            // Redirects to a new dedicated page for section/question handling
                            onClick={() => navigate(`/admin/quizzes/questions/${quizId}`)} 
                            disabled={sections.length === 0}
                        >
                            <ArrowRight className="mr-2 h-4 w-4" /> Go to Section Manager
                        </Button>
                        {sections.length === 0 && (
                            <p className="text-xs text-red-500 mt-2">Define sections above to enable question management.</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default QuizForm;