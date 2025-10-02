// src/components/user/WeaknessSets.tsx

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TrendingDown, Brain, ArrowLeft } from 'lucide-react'; // 💡 Added ArrowLeft icon
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

type WeakTopic = {
    topic_id: string;
    topic_name: string;
    failure_rate: number;
    incorrect_count: number;
    total_attempts: number;
};

const WeaknessSets = () => {
    const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const fetchWeaknesses = async () => {
            setLoading(true);
            const session = (await supabase.auth.getSession()).data.session;
            if (!session) {
                setLoading(false);
                return;
            }
            
            try {
                // Fetch the user's top 3 weakest topics using the SQL View
                const { data, error } = await supabase
                    .from('user_topic_performance')
                    .select('topic_id, topic_name, failure_rate, incorrect_count, total_attempts')
                    .eq('user_id', session.user.id)
                    .order('failure_rate', { ascending: false })
                    .limit(3);

                if (error) {
                    console.error("Error fetching weaknesses:", error);
                    toast({
                        title: "Analytics Error",
                        description: `Failed to load weakness report. Please check your RLS policies or network.`,
                        variant: "destructive",
                    });
                } else {
                    setWeakTopics(data as WeakTopic[] || []);
                }
            } catch (e) {
                console.error("Fetch exception:", e);
                toast({
                    title: "System Error",
                    description: `Could not connect to database for analytics.`,
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchWeaknesses();
    }, [toast]);

    if (loading) return (
        <Card className="border-border/50 bg-card p-6">
            <p className="text-center text-muted-foreground">Analyzing performance...</p>
        </Card>
    );

    return (
        <div className="space-y-4">
            
            {/* 💡 NEW: Back to Dashboard Button */}
            <Button 
                variant="ghost" 
                onClick={() => navigate('/user/dashboard')} 
                className="text-primary hover:text-primary/80 -ml-4"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
            
            {weakTopics.length === 0 ? (
                // Empty State Card
                <Card className="p-6 border-l-4 border-green-500 bg-card shadow-sm">
                    <CardTitle className="text-lg flex items-center text-green-700">
                        <Brain className="h-5 w-5 mr-2" /> Great Progress!
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        Keep practicing. We need to track a few more quizzes (**min. 2 attempts per topic**) to identify specific weaknesses and unlock personalized sets.
                    </p>
                    <Button variant="link" className="p-0 mt-2 h-auto text-primary" onClick={() => navigate('/app/quizzes')}>
                        Browse available quizzes &rarr;
                    </Button>
                </Card>
            ) : (
                // Data Display
                <>
                    {/* Header matches the style of "Available Quizzes" section header */}
                    <h3 className="mb-2 text-2xl font-bold flex items-center text-foreground border-b pb-2">
                        <TrendingDown className="h-6 w-6 mr-2 text-red-500" /> Your Top Weaknesses
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Focus your review on these topics for the fastest skill improvement.
                    </p>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                        {weakTopics.map((topic) => (
                            <Card 
                                key={topic.topic_id} 
                                className="p-4 border-l-4 border-red-500 hover:shadow-lg transition-shadow bg-card" // Base card style
                            >
                                <CardHeader className="p-0 mb-2">
                                    <CardTitle className="text-lg text-foreground">{topic.topic_name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 space-y-1 text-sm">
                                    {/* Stats Line */}
                                    <div className="flex justify-between items-center py-1 border-t border-border mt-1">
                                        <p className="text-sm font-medium text-muted-foreground">Failure Rate</p>
                                        <p className="text-xl font-bold text-red-500">
                                            {(topic.failure_rate * 100).toFixed(0)}%
                                        </p>
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {topic.incorrect_count} incorrect attempts out of {topic.total_attempts} total.
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default WeaknessSets;