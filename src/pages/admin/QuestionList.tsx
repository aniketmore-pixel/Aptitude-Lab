// src/pages/Admin/QuestionList.tsx (or QuestionManagement.tsx, if you prefer)

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileQuestion, ChevronLeft } from 'lucide-react';

const QuestionList = () => {
    const navigate = useNavigate();

    // 💡 Option 1: Redirect to Quiz Management (Since questions are tied to quizzes)
    // useEffect(() => {
    //     navigate('/admin/quizzes');
    // }, [navigate]);
    
    // return null; // Render nothing while redirecting

    // 💡 Option 2: Provide instructions and a link to the Quizzes page
    return (
        <div className="container mx-auto py-12 max-w-xl">
            <Card className="p-8 text-center shadow-lg border-primary/20">
                <FileQuestion className="mx-auto mb-4 h-16 w-16 text-primary" />
                <h1 className="text-2xl font-bold mb-3">Question Management</h1>
                <p className="mb-6 text-muted-foreground">
                    In this system, questions are managed primarily through their associated quizzes. 
                    Please select a quiz to view, edit, or add new questions.
                </p>
                <div className="space-y-3">
                    <Button className="w-full" onClick={() => navigate('/admin/quizzes')}>
                        Go to Quiz Management
                        <ChevronLeft className="ml-2 h-4 w-4 transform rotate-180" />
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => navigate('/admin')}>
                        Back to Dashboard
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default QuestionList;