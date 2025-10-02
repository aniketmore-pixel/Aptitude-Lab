import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, TrendingUp, Target, CheckCircle, Users, BarChart3, Shield, Zap, Award, BookOpen, Clock, Lightbulb, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted">
            
            
            {/* Hero Section */}
            <section className="relative overflow-hidden px-4 py-20 md:py-32">
                {/* Grid Background */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iaHNsKDI0MCwgMjAlLCA5MiUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
                
                <div className="container relative mx-auto max-w-6xl text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                        <Brain className="h-4 w-4" />
                        Open-Source Quantitative Aptitude Platform
                    </div>
                    
                    {/* Heading Gradient Enhanced */}
                    <h1 className="mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-5xl font-bold text-transparent md:text-7xl">
                        Master Quantitative
                        <br />
                        Aptitude Skills
                    </h1>
                    
                    <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground md:text-xl">
                        Practice, analyze, and improve your quantitative skills with our comprehensive quiz platform. 
                        Track your progress with detailed analytics and topic-wise reports.
                    </p>
                    
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link to="/auth?mode=signup">
                            <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                                Start Learning Free
                            </Button>
                        </Link>
                        <Link to="/auth?mode=login">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold border-primary hover:bg-primary/5">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section - Colors Adjusted for Flow */}
            <section className="px-4 py-20 bg-muted/50">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                            How It Works
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Your journey to quantitative excellence in three simple steps
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="relative text-center">
                            {/* Step 1: Primary Color */}
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold shadow-lg">
                                1
                            </div>
                            <h3 className="mb-3 text-xl font-semibold">Choose Your Topic</h3>
                            <p className="text-muted-foreground">
                                Select from various quantitative topics like arithmetic, algebra, geometry, and data interpretation
                            </p>
                            {/* Connection line */}
                            <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-primary to-secondary md:block" />
                        </div>

                        <div className="relative text-center">
                            {/* Step 2: Secondary Color */}
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-2xl font-bold shadow-lg">
                                2
                            </div>
                            <h3 className="mb-3 text-xl font-semibold">Take the Quiz</h3>
                            <p className="text-muted-foreground">
                                Answer questions at your own pace with instant feedback and detailed explanations
                            </p>
                            {/* Connection line */}
                            <div className="absolute right-0 top-8 hidden h-0.5 w-full translate-x-1/2 bg-gradient-to-r from-secondary to-accent md:block" />
                        </div>

                        <div className="relative text-center">
                            {/* Step 3: Accent Color */}
                            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-foreground text-2xl font-bold shadow-lg">
                                3
                            </div>
                            <h3 className="mb-3 text-xl font-semibold">Track Progress</h3>
                            <p className="text-muted-foreground">
                                Review detailed analytics and identify areas for improvement with smart reports
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            

            {/* Features Section - Icon Backgrounds Adjusted */}
            <section className="px-4 py-20 bg-muted/30">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                            Everything You Need to Excel
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Powerful features designed for effective learning
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="group border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                <Target className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Topic-Wise Practice</h3>
                            <p className="text-muted-foreground">
                                Practice questions organized by categories and topics for focused learning
                            </p>
                        </Card>

                        <Card className="group border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 text-secondary transition-transform group-hover:scale-110">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Detailed Analytics</h3>
                            <p className="text-muted-foreground">
                                Track your progress with comprehensive reports and performance insights
                            </p>
                        </Card>

                        <Card className="group border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent transition-transform group-hover:scale-110">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Progress Tracking</h3>
                            <p className="text-muted-foreground">
                                Monitor your improvement over time with visual progress indicators
                            </p>
                        </Card>

                        <Card className="group border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                            {/* Adjusted color for Daily Quizzes for variety/freshness (e.g., success color) */}
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-500 transition-transform group-hover:scale-110">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Daily Quizzes</h3>
                            <p className="text-muted-foreground">
                                Fresh challenges every day to keep your skills sharp and engaged
                            </p>
                        </Card>

                        <Card className="group border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                            {/* Adjusted color for Admin Dashboard (e.g., info/warning color) */}
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500 transition-transform group-hover:scale-110">
                                <Users className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Admin Dashboard</h3>
                            <p className="text-muted-foreground">
                                Comprehensive tools for managing questions, quizzes, and analyzing results
                            </p>
                        </Card>

                        <Card className="group border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                                <Brain className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold">Smart Reports</h3>
                            <p className="text-muted-foreground">
                                Category-wise and topic-wise analysis of your strengths and weaknesses
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Topics Covered Section - Colors Maintained */}
            <section className="px-4 py-20 bg-muted/50">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                            Topics We Cover
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Comprehensive coverage of all quantitative aptitude topics
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            { title: "Arithmetic", icon: <BookOpen className="h-5 w-5" />, topics: ["Percentages", "Profit & Loss", "Simple & Compound Interest", "Time & Work"] },
                            { title: "Algebra", icon: <Lightbulb className="h-5 w-5" />, topics: ["Linear Equations", "Quadratic Equations", "Progressions", "Functions"] },
                            { title: "Geometry", icon: <Target className="h-5 w-5" />, topics: ["Triangles", "Circles", "Mensuration", "Coordinate Geometry"] },
                            { title: "Data Analysis", icon: <BarChart3 className="h-5 w-5" />, topics: ["Tables", "Graphs", "Charts", "Data Interpretation"] },
                        ].map((category, index) => (
                            <Card key={index} className="border-border/50 bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg">
                                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    {category.icon}
                                </div>
                                <h3 className="mb-3 text-lg font-semibold">{category.title}</h3>
                                <ul className="space-y-2">
                                    {category.topics.map((topic, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            {/* Primary Checkmark */}
                                            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                                            {topic}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section - Colors Maintained/Refined */}
            <section className="px-4 py-20">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid gap-12 md:grid-cols-2 items-center">
                        <div>
                            <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                                Why Choose Our Platform?
                            </h2>
                            <div className="space-y-6">
                                {/* Feature 1: Primary */}
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Zap className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold">Instant Feedback</h3>
                                        <p className="text-muted-foreground">
                                            Get immediate results and detailed explanations for every question
                                        </p>
                                    </div>
                                </div>

                                {/* Feature 2: Secondary */}
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold">Learn at Your Pace</h3>
                                        <p className="text-muted-foreground">
                                            No time limits or pressure - practice whenever and wherever you want
                                        </p>
                                    </div>
                                </div>

                                {/* Feature 3: Accent */}
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                                        <Award className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold">Expert Content</h3>
                                        <p className="text-muted-foreground">
                                            Questions curated by subject matter experts with proven methodologies
                                        </p>
                                    </div>
                                </div>

                                {/* Feature 4: Primary */}
                                <div className="flex gap-4">
                                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold">100% Free & Open Source</h3>
                                        <p className="text-muted-foreground">
                                            No hidden costs, no subscriptions - completely free forever
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Card Section - Bar Colors Adjusted */}
                        <div className="relative">
                            <Card className="border-border/50 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-8">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-border pb-4">
                                        <span className="text-muted-foreground">Your Progress</span>
                                        <span className="text-2xl font-bold text-primary">78%</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Arithmetic</span>
                                            <span className="font-medium">95%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            {/* Primary Progress Bar */}
                                            <div className="h-full w-[95%] rounded-full bg-primary transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Algebra</span>
                                            <span className="font-medium">82%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            {/* Secondary Progress Bar */}
                                            <div className="h-full w-[82%] rounded-full bg-secondary transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Geometry</span>
                                            <span className="font-medium">67%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                            {/* Accent Progress Bar */}
                                            <div className="h-full w-[67%] rounded-full bg-accent transition-all" />
                                        </div>
                                    </div>
                                    <Button className="w-full" variant="outline">
                                        View Detailed Report <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Gradient Adjusted */}
            <section className="px-4 py-20 bg-muted/30">
                <div className="container mx-auto max-w-4xl">
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                            Ready to Boost Your Skills?
                        </h2>
                        <p className="mb-8 text-lg text-muted-foreground">
                            Join thousands of learners improving their quantitative aptitude every day
                        </p>
                        <Link to="/auth?mode=signup">
                            <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                                Get Started Now
                            </Button>
                        </Link>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border bg-muted/30 px-4 py-8">
                <div className="container mx-auto max-w-6xl text-center text-sm text-muted-foreground">
                    <p>© 2025 Quantitative Aptitude Quiz Platform. Open-source and free to use.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;