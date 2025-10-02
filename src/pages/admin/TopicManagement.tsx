import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // 💡 Import useNavigate
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit, Trash2, Save, X, ArrowLeft } from "lucide-react"; // 💡 Added ArrowLeft
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Topic = {
    id: string;
    name: string;
    created_at: string;
};

const TopicManagement = () => {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [newTopicName, setNewTopicName] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // State for editing a specific topic
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    const navigate = useNavigate(); // 💡 Initialize useNavigate
    const { toast } = useToast();

    // --- Data Fetching ---
    const fetchTopics = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('topics')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to load topics.", variant: "destructive" });
        } else {
            setTopics(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTopics();
    }, []);

    // --- Handlers ---
    
    const handleCreateTopic = async () => {
        const trimmedName = newTopicName.trim();
        if (!trimmedName) return;

        setIsSaving(true);
        const { error } = await supabase
            .from('topics')
            .insert([{ name: trimmedName }]);
        
        if (error) {
            toast({ title: "Error", description: `Failed to create topic: ${error.message}`, variant: "destructive" });
        } else {
            setNewTopicName('');
            fetchTopics();
            toast({ title: "Success", description: `Topic '${trimmedName}' created.` });
        }
        setIsSaving(false);
    };

    const handleStartEdit = (topic: Topic) => {
        setEditingId(topic.id);
        setEditingName(topic.name);
    };
    
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    const handleSaveEdit = async (id: string) => {
        const trimmedName = editingName.trim();
        if (!trimmedName) return;

        setIsSaving(true);
        const { error } = await supabase
            .from('topics')
            .update({ name: trimmedName })
            .eq('id', id);

        if (error) {
            toast({ title: "Error", description: `Failed to rename topic: ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Success", description: `Topic renamed to '${trimmedName}'.` });
            handleCancelEdit();
            fetchTopics();
        }
        setIsSaving(false);
    };


    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete the topic: "${name}"? This may affect questions linked to it.`)) {
            return;
        }

        const { error } = await supabase.from('topics').delete().eq('id', id);

        if (error) {
            toast({ title: "Error", description: `Failed to delete topic: ${error.message}`, variant: "destructive" });
        } else {
            fetchTopics();
            toast({ title: "Success", description: `Topic '${name}' deleted.` });
        }
    };


    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading Topics...</div>;
    }

    return (
        <div className="container mx-auto py-8">
            {/* 💡 BACK BUTTON INTEGRATION */}
            <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/dashboard')} 
                className="mb-6 text-primary hover:text-primary/80"
            >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>
            
            <h1 className="text-3xl font-bold mb-6">Topic Management</h1>
            <p className="text-muted-foreground mb-8">
                These topics are used to organize questions (Question Management) and provide detailed reporting.
            </p>

            {/* Create New Topic Form */}
            <Card className="mb-8 border-l-4 border-primary">
                <CardHeader>
                    <CardTitle>Add New Topic</CardTitle>
                </CardHeader>
                <CardContent className="flex space-x-4">
                    <Input
                        placeholder="e.g., Linear Algebra, React Hooks, Supply Chain"
                        value={newTopicName}
                        onChange={(e) => setNewTopicName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateTopic()}
                        className="flex-1"
                        disabled={isSaving}
                    />
                    <Button onClick={handleCreateTopic} disabled={!newTopicName.trim() || editingId !== null || isSaving}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Create Topic
                    </Button>
                </CardContent>
            </Card>

            {/* Existing Topics List */}
            <Card>
                <CardHeader>
                    <CardTitle>Existing Topics ({topics.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {topics.length === 0 ? (
                            <p className="text-center text-muted-foreground p-4">No topics created yet.</p>
                        ) : (
                            topics.map((topic) => (
                                <div key={topic.id} className="flex justify-between items-center p-3 border rounded-md">
                                    {editingId === topic.id ? (
                                        // Edit Mode
                                        <div className="flex w-full space-x-2">
                                            <Input
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(topic.id)}
                                                className="flex-grow"
                                                disabled={isSaving}
                                            />
                                            <Button 
                                                size="icon" 
                                                onClick={() => handleSaveEdit(topic.id)} 
                                                disabled={!editingName.trim() || isSaving}
                                            >
                                                <Save className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="outline" onClick={handleCancelEdit}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <>
                                            <span className="font-medium text-lg">{topic.name}</span>
                                            <div className="space-x-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="icon" 
                                                    onClick={() => handleStartEdit(topic)}
                                                    disabled={editingId !== null}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    size="icon" 
                                                    onClick={() => handleDelete(topic.id, topic.name)}
                                                    disabled={editingId !== null}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TopicManagement;