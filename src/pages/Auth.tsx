import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Loader2 } from "lucide-react";

const Auth = () => {
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "signup");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    // 💡 Determine redirect path based on user role (fetched after successful login)
    const handleRedirect = (isAdmin: boolean) => {
        if (isAdmin) {
            navigate("/admin/dashboard");
        } else {
            navigate("/user/dashboard");
        }
    };

    useEffect(() => {
        // Check if user is already logged in
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // 💡 Check role of the existing session user
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', session.user.id)
                    .maybeSingle();

                handleRedirect(profile?.is_admin || false);
            }
        };
        checkUser();
    }, [navigate]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
                
                // 1. Successful Login: Check the user's role from the 'profiles' table
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', data.user!.id) // Use the newly logged-in user ID
                    .single();

                if (profileError) throw profileError;

                // 2. Redirect based on role status
                handleRedirect(profile.is_admin);
                
                toast({
                    title: "Welcome back!",
                    description: "You've successfully signed in.",
                });

            } else {
                // Regular User Signup (No admin check needed here)
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/user/dashboard`,
                    },
                });

                if (error) throw error;

                toast({
                    title: "Account created!",
                    description: "Welcome to the platform. You can now start learning.",
                });
                navigate("/user/dashboard");
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Authentication Failed",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 px-4">
            <Card className="w-full max-w-md border-border/50 p-8 shadow-xl">
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
                        <Brain className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold">
                        {/* Title logic simplified slightly */}
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isLogin
                            ? "Sign in to continue your learning journey"
                            : "Start your quantitative aptitude journey"}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {/* Email and Password Inputs (Unchanged) */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            minLength={6}
                            className="h-11"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="h-11 w-full font-semibold"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {isLogin ? "Signing in..." : "Creating account..."}
                            </>
                        ) : (
                            <>{isLogin ? "Sign In" : "Sign Up"}</>
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary hover:underline"
                        disabled={loading}
                    >
                        {isLogin
                            ? "Don't have an account? Sign up"
                            : "Already have an account? Sign in"}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default Auth;