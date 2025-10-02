// // // src/pages/QuizPage.tsx

// // import { useEffect, useState, useCallback, useMemo } from "react";
// // import { useParams, useNavigate } from "react-router-dom";
// // import { supabase } from "@/integrations/supabase/client";
// // import { useToast } from "@/hooks/use-toast";
// // import { Button } from "@/components/ui/button";
// // import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
// // import { Clock, CheckCircle, List, Square, CheckSquare } from "lucide-react";

// // // --- NEW TYPES ---
// // type Question = {
// //     id: string;
// //     question_text: string;
// //     options: string[];
// //     correct_answer: string;
// //     quiz_section_name: string; 
// //     topic_id: string | null;
// // };

// // type QuizDetails = {
// //     id: string;
// //     title: string;
// //     description: string;
// //     time_limit: string | null; // e.g., "00:01:00" or "30 minutes"
// //     sections: string[];       
// // };

// // type DetailedAnswer = {
// //     question_id: string;
// //     question_text: string;
// //     quiz_section_name: string;
// //     user_answer: string | null;
// //     correct_answer: string;
// //     is_correct: boolean;
// // };
// // // --- END NEW TYPES ---


// // const QuizPage = () => {
// //     const { quizId } = useParams<{ quizId: string }>();
// //     const navigate = useNavigate();
// //     const { toast } = useToast();
    
// //     // Quiz Flow State
// //     const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
// //     const [questions, setQuestions] = useState<Question[]>([]);
// //     const [topicMap, setTopicMap] = useState<Record<string, string>>({});
// //     const [loading, setLoading] = useState(true);
// //     const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
// //     const [userAnswers, setUserAnswers] = useState<Record<string, string | null>>({});
// //     const [isFinished, setIsFinished] = useState(false);
// //     const [score, setScore] = useState(0);
    
// //     // Timer State
// //     const [startTime, setStartTime] = useState<Date | null>(null);
// //     const [timeLeft, setTimeLeft] = useState(0); 
// //     const [isRunning, setIsRunning] = useState(false);
    
// //     // --- UTILITIES ---
// //     const formatTime = (totalSeconds: number) => {
// //         const minutes = Math.floor(totalSeconds / 60);
// //         const seconds = totalSeconds % 60;
// //         return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
// //     };

// //     // 💡 FINAL FIX: Robustly handles HH:MM:SS or word formats
// //     const parseTimeLimitToSeconds = (timeLimit: string | null): number => {
// //         if (!timeLimit) return 0;
        
// //         let totalSeconds = 0;

// //         // 1. Try to parse HH:MM:SS format (e.g., 00:01:00)
// //         const timeMatch = timeLimit.match(/(\d+):(\d{2}):(\d{2})/);
// //         if (timeMatch) {
// //             const hours = parseInt(timeMatch[1]);
// //             const minutes = parseInt(timeMatch[2]);
// //             const seconds = parseInt(timeMatch[3]);
// //             totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
// //         } 
// //         // 2. Fallback to parsing word formats (e.g., '1 hour 30 minutes')
// //         else {
// //             const parts = timeLimit.split(/\s+/);
// //             for (let i = 0; i < parts.length; i++) {
// //                 const part = parts[i];
// //                 const nextPart = parts[i + 1];

// //                 if (!isNaN(Number(part))) {
// //                     const value = parseInt(part);
// //                     if (nextPart?.startsWith('min')) {
// //                         totalSeconds += value * 60;
// //                     } else if (nextPart?.startsWith('hour')) {
// //                         totalSeconds += value * 3600;
// //                     }
// //                 }
// //             }
// //         }
        
// //         // Use 30 minutes as fallback if still 0 but a limit was set.
// //         return totalSeconds > 0 ? totalSeconds : (timeLimit ? 1800 : 0); 
// //     };
    
// //     // --- SUBMISSION LOGIC (MUST BE DEFINED EARLY) ---
// //     const handleSubmitQuiz = useCallback(async (isTimedOut: boolean) => {
// //         setIsRunning(false);
// //         setLoading(true);

// //         const endTime = new Date();
// //         const durationMs = startTime ? endTime.getTime() - startTime.getTime() : 0;
// //         const completionTimeInterval = `${Math.floor(durationMs / 1000)} seconds`;
        
// //         let calculatedScore = 0;
// //         const detailedAnswers = questions.map(question => {
// //             const userAnswer = userAnswers[question.id];
// //             const isCorrect = userAnswer === question.correct_answer;
            
// //             if (isCorrect) {
// //                 calculatedScore += 1;
// //             }

// //             const topicName = question.topic_id ? topicMap[question.topic_id] : 'General';

// //             return {
// //                 question_id: question.id,
// //                 question_text: question.question_text,
// //                 quiz_section_name: question.quiz_section_name,
// //                 topic_name: topicName, 
// //                 user_answer: userAnswer,
// //                 correct_answer: question.correct_answer,
// //                 is_correct: isCorrect,
// //             };
// //         });
        
// //         setScore(calculatedScore);
// //         setIsFinished(true); 

// //         const userSession = await supabase.auth.getSession();
// //         const userId = userSession.data.session?.user.id;

// //         if (!userId || !quizDetails) {
// //             toast({ title: "Error", description: "User session or quiz data missing.", variant: "destructive" });
// //             setLoading(false);
// //             return;
// //         }

// //         const percentageScore = (calculatedScore / questions.length) * 100;
        
// //         const { error: submitError, data: resultData } = await supabase.from('quiz_results').insert({
// //             user_id: userId,
// //             quiz_id: quizDetails.id,
// //             score: calculatedScore,
// //             total_questions: questions.length,
// //             percentage_score: percentageScore,
// //             completion_time: completionTimeInterval, 
// //             completed_at: new Date().toISOString(),
// //             detailed_answers: detailedAnswers, 
// //         }).select('id').maybeSingle();

// //         if (submitError || !resultData) {
// //             console.error('Submission Error:', submitError);
// //             toast({ title: "Error", description: `Failed to save result.`, variant: "destructive" });
// //         } else {
// //              const resultId = resultData.id;
// //              toast({ title: "Quiz Complete!", description: "Your answers have been submitted.", variant: "success" });
// //              navigate(`/quiz/results/${resultId}`, { replace: true });
// //              return; 
// //         }

// //         setLoading(false);

// //     }, [questions, userAnswers, quizDetails, toast, startTime, navigate, topicMap]);

// //     // --- TIMER EFFECT (FIXED DEPENDENCY) ---
// //     useEffect(() => {
// //         if (!isRunning) return;

// //         const timer = setInterval(() => {
// //             setTimeLeft((prevTime) => {
// //                 if (prevTime <= 1) {
// //                     clearInterval(timer);
// //                     if (prevTime === 1) { 
// //                         handleSubmitQuiz(true); 
// //                     }
// //                     return 0;
// //                 }
// //                 return prevTime - 1;
// //             });
// //         }, 1000);

// //         return () => clearInterval(timer);
// //     }, [isRunning, handleSubmitQuiz]);


// //     // --- DATA FETCHING EFFECT ---
// //     useEffect(() => {
// //         const fetchData = async () => {
// //             if (!quizId) return;

// //             const userSession = await supabase.auth.getSession();
// //             if (!userSession.data.session) {
// //                 toast({ title: "Error", description: "Please log in to start the quiz.", variant: "destructive" });
// //                 navigate('/auth?mode=login');
// //                 return;
// //             }

// //             // 2. Fetch Quiz Details
// //             const { data: qData, error: qError } = await supabase
// //                 .from('quizzes')
// //                 .select('id, title, description, time_limit, sections') 
// //                 .eq('id', quizId)
// //                 .maybeSingle();

// //             if (qError || !qData || !qData.sections || qData.sections.length === 0) {
// //                 toast({ title: "Error", description: "Quiz is not available or has no sections defined.", variant: "destructive" });
// //                 navigate('/dashboard');
// //                 return;
// //             }
            
// //             const details = qData as QuizDetails;
// //             setQuizDetails(details); 

// //             // 3. Fetch Questions and Topics
// //             const { data: qsData, error: qsError } = await supabase
// //                 .from('questions')
// //                 .select('id, question_text, options, correct_answer, quiz_section_name, topic_id') 
// //                 .eq('quiz_id', quizId)
// //                 .order('quiz_section_name', { ascending: true }) 
// //                 .order('id', { ascending: true }); 

// //             if (qsError || !qsData || qsData.length === 0) {
// //                 toast({ title: "Error", description: "No questions found for this quiz.", variant: "destructive" });
// //                 navigate('/dashboard');
// //                 return;
// //             }
            
// //             // 4. Fetch Topic Map
// //             const topicIds = qsData.map(q => q.topic_id).filter((id): id is string => !!id);
// //             const { data: topicsData } = await supabase
// //                 .from('topics')
// //                 .select('id, name')
// //                 .in('id', Array.from(new Set(topicIds)));
            
// //             const topicMapData = (topicsData || []).reduce((acc, topic) => {
// //                 acc[topic.id] = topic.name;
// //                 return acc;
// //             }, {} as Record<string, string>);

// //             setTopicMap(topicMapData); 

// //             setQuestions(qsData as Question[]);
// //             const initialAnswers = qsData.reduce((acc, q) => ({ ...acc, [q.id]: null }), {});
// //             setUserAnswers(initialAnswers);
            
            
// //             // 💡 CRITICAL FIX: Set timeLeft using the helper function on fetched data
// //             const durationSec = parseTimeLimitToSeconds(details.time_limit);
// //             setTimeLeft(durationSec); // Set the correct, dynamic duration
            
// //             setLoading(false);
// //             setStartTime(new Date());
// //             setIsRunning(true); 

// //         };

// //         fetchData();
// //         return () => setIsRunning(false); 
// //     }, [quizId, navigate, toast]);


// //     // --- RENDERING HELPERS ---
// //     const handleAnswerSelect = (questionId: string, answer: string) => {
// //         if (isFinished) return;
// //         setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
// //     };
    
// //     const handleSectionJump = (sectionName: string) => {
// //         const firstIndexInSection = questions.findIndex(q => q.quiz_section_name === sectionName);
// //         if (firstIndexInSection !== -1) {
// //             setCurrentQuestionIndex(firstIndexInSection);
// //         }
// //     };


// //     // --- RENDER LOGIC ---

// //     if (loading || !quizDetails || questions.length === 0) {
// //         return (
// //             <div className="flex min-h-screen items-center justify-center">
// //                 <p className="text-muted-foreground">Loading Quiz, please wait...</p>
// //             </div>
// //         );
// //     }
    
// //     const currentQuestion = questions[currentQuestionIndex];
// //     const isLastQuestion = currentQuestionIndex === questions.length - 1;
// //     const currentAnswer = userAnswers[currentQuestion.id];
// //     const questionsPerSection = questions.reduce((acc, q) => {
// //         acc[q.quiz_section_name] = (acc[q.quiz_section_name] || 0) + 1;
// //         return acc;
// //     }, {} as Record<string, number>);

// //     // If quiz is finished, the logic should have navigated away via handleSubmitQuiz

// //     return (
// //         <div className="min-h-screen bg-gradient-to-b from-background to-muted pt-8">
// //             <div className="container mx-auto max-w-6xl flex space-x-6">
                
// //                 {/* 1. Sidebar/Navigation */}
// //                 <Card className="w-1/4 h-fit sticky top-8 shadow-lg hidden lg:block">
// //                     <CardHeader className="p-4 border-b">
// //                         <CardTitle className="text-lg">Quiz Structure</CardTitle>
// //                     </CardHeader>
// //                     <CardContent className="p-4 space-y-3">
// //                         {quizDetails.sections.map((sectionName) => (
// //                             <div 
// //                                 key={sectionName}
// //                                 onClick={() => handleSectionJump(sectionName)}
// //                                 className={`cursor-pointer p-2 rounded-lg transition-colors 
// //                                     ${currentQuestion.quiz_section_name === sectionName 
// //                                         ? 'bg-primary text-primary-foreground font-semibold shadow-md' 
// //                                         : 'hover:bg-muted/70'
// //                                     }`
// //                                 }
// //                             >
// //                                 <div className="flex justify-between items-center text-sm">
// //                                     <span>{sectionName}</span>
// //                                     <span className={`px-2 py-0.5 rounded ${currentQuestion.quiz_section_name === sectionName ? 'bg-primary-foreground text-primary' : 'bg-muted'}`}>
// //                                         {questionsPerSection[sectionName] || 0} Qs
// //                                     </span>
// //                                 </div>
// //                             </div>
// //                         ))}
// //                     </CardContent>
// //                 </Card>

// //                 {/* 2. Main Question Area */}
// //                 <div className="w-full lg:w-3/4 space-y-6">
                    
// //                     {/* Header/Timer */}
// //                     <div className="flex justify-between items-center p-4 rounded-lg bg-card shadow-md">
// //                         <h1 className="text-xl font-bold">{quizDetails.title}</h1>
                        
// //                         <div className="text-sm font-medium px-3 py-1 bg-secondary rounded-full">
// //                             Section: {currentQuestion.quiz_section_name}
// //                         </div>

// //                         <div className={`flex items-center space-x-2 font-mono text-xl ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
// //                             <Clock className="h-5 w-5" />
// //                             <span>{formatTime(timeLeft)}</span>
// //                         </div>
// //                     </div>

// //                     {/* Question Card */}
// //                     <Card className="shadow-2xl">
// //                         <CardHeader>
// //                             <CardTitle className="text-lg">
// //                                 Question {currentQuestionIndex + 1} of {questions.length}
// //                             </CardTitle>
// //                             <CardDescription className="text-base text-gray-700">
// //                                 {currentQuestion.question_text}
// //                             </CardDescription>
// //                         </CardHeader>
                        
// //                         <CardContent className="space-y-4">
// //                             {/* Options */}
// //                             {currentQuestion.options.map((option, index) => (
// //                                 <div
// //                                     key={index}
// //                                     className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center space-x-3 ${
// //                                         currentAnswer === option 
// //                                             ? 'bg-primary text-primary-foreground border-primary shadow-md' 
// //                                             : 'hover:bg-muted/50'
// //                                     }`}
// //                                     onClick={() => handleAnswerSelect(currentQuestion.id, option)}
// //                                 >
// //                                     {currentAnswer === option ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
// //                                     <span className="font-medium flex-grow">{option}</span>
// //                                 </div>
// //                             ))}
// //                         </CardContent>
                        
// //                         <CardFooter className="flex justify-between border-t pt-4">
// //                             <Button 
// //                                 onClick={() => setCurrentQuestionIndex(prev => prev - 1)} 
// //                                 disabled={currentQuestionIndex === 0} 
// //                                 variant="outline"
// //                             >
// //                                 Previous
// //                             </Button>
                            
// //                             <Button 
// //                                 onClick={isLastQuestion ? () => handleSubmitQuiz(false) : () => setCurrentQuestionIndex(prev => prev + 1)}
// //                                 disabled={!currentAnswer && !isLastQuestion} 
// //                             >
// //                                 {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
// //                             </Button>
// //                         </CardFooter>
// //                     </Card>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default QuizPage;

// // src/pages/QuizPage.tsx

// import { useEffect, useState, useCallback, useMemo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { supabase } from "@/integrations/supabase/client";
// import { useToast } from "@/hooks/use-toast";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
// import { Clock, CheckCircle, List, Square, CheckSquare } from "lucide-react";

// // --- TYPES ---
// type Question = {
//     id: string;
//     question_text: string;
//     options: string[];
//     correct_answer: string;
//     quiz_section_name: string; 
//     topic_id: string | null;
// };

// type QuizDetails = {
//     id: string;
//     title: string;
//     description: string;
//     time_limit: string | null; // e.g., "00:01:00" or "30 minutes"
//     sections: string[];       
// };

// type DetailedAnswer = {
//     question_id: string;
//     question_text: string;
//     quiz_section_name: string;
//     user_answer: string | null;
//     correct_answer: string;
//     is_correct: boolean;
// };
// // --- END TYPES ---


// const QuizPage = () => {
//     const { quizId } = useParams<{ quizId: string }>();
//     const navigate = useNavigate();
//     const { toast } = useToast();
    
//     // Quiz Flow State
//     const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
//     const [questions, setQuestions] = useState<Question[]>([]);
//     const [topicMap, setTopicMap] = useState<Record<string, string>>({});
//     const [loading, setLoading] = useState(true);
//     const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//     const [userAnswers, setUserAnswers] = useState<Record<string, string | null>>({});
//     const [isFinished, setIsFinished] = useState(false);
//     const [score, setScore] = useState(0);
    
//     // Timer State
//     const [startTime, setStartTime] = useState<Date | null>(null);
//     const [timeLeft, setTimeLeft] = useState(0); 
//     const [isRunning, setIsRunning] = useState(false);
    
//     // --- UTILITIES ---
//     const formatTime = (totalSeconds: number) => {
//         const minutes = Math.floor(totalSeconds / 60);
//         const seconds = totalSeconds % 60;
//         return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//     };

//     const parseTimeLimitToSeconds = (timeLimit: string | null): number => {
//         if (!timeLimit) return 0;
        
//         let totalSeconds = 0;

//         // 1. Try to parse HH:MM:SS format (e.g., 00:01:00)
//         const timeMatch = timeLimit.match(/(\d+):(\d{2}):(\d{2})/);
//         if (timeMatch) {
//             const hours = parseInt(timeMatch[1]);
//             const minutes = parseInt(timeMatch[2]);
//             const seconds = parseInt(timeMatch[3]);
//             totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
//         } 
//         // 2. Fallback to parsing word formats
//         else {
//             const parts = timeLimit.split(/\s+/);
//             for (let i = 0; i < parts.length; i++) {
//                 const part = parts[i];
//                 const nextPart = parts[i + 1];

//                 if (!isNaN(Number(part))) {
//                     const value = parseInt(part);
//                     if (nextPart?.startsWith('min')) {
//                         totalSeconds += value * 60;
//                     } else if (nextPart?.startsWith('hour')) {
//                         totalSeconds += value * 3600;
//                     }
//                 }
//             }
//         }
        
//         return totalSeconds > 0 ? totalSeconds : (timeLimit ? 1800 : 0); 
//     };
    
//     // --- SUBMISSION LOGIC (THE FIX IS HERE) ---
//     const handleSubmitQuiz = useCallback(async (isTimedOut: boolean) => {
//         setIsRunning(false);
//         setLoading(true);

//         const endTime = new Date();
//         const durationMs = startTime ? endTime.getTime() - startTime.getTime() : 0;
//         const completionTimeInterval = `${Math.floor(durationMs / 1000)} seconds`;
        
//         const userSession = await supabase.auth.getSession();
//         const userId = userSession.data.session?.user.id;

//         if (!userId || !quizDetails) {
//             toast({ title: "Error", description: "User session or quiz data missing.", variant: "destructive" });
//             setLoading(false);
//             return;
//         }

//         let calculatedScore = 0;
//         const submissionsPayload: any[] = []; // Array to hold records for question_submissions table

//         // --- Step 1: Calculate Score and Prepare Payloads ---
//         const detailedAnswers = questions.map(question => {
//             const userAnswer = userAnswers[question.id];
//             const isCorrect = userAnswer === question.correct_answer;
            
//             if (isCorrect) {
//                 calculatedScore += 1;
//             }

//             // Prepare payload for the 'question_submissions' table (Weakness Tracking)
//             if (question.topic_id) {
//                  submissionsPayload.push({
//                     user_id: userId,
//                     question_id: question.id,
//                     is_correct: isCorrect,
//                     // If you track quiz attempt ID, include it here: quiz_attempt_id: attemptId
//                  });
//             }

//             // Prepare payload for the detailed_answers JSON in 'quiz_results'
//             const topicName = question.topic_id ? topicMap[question.topic_id] : 'General';
//             return {
//                 question_id: question.id,
//                 question_text: question.question_text,
//                 quiz_section_name: question.quiz_section_name,
//                 topic_name: topicName, 
//                 user_answer: userAnswer,
//                 correct_answer: question.correct_answer,
//                 is_correct: isCorrect,
//             };
//         });
        
//         setScore(calculatedScore);
//         setIsFinished(true); 

//         // --- Step 2: Save Individual Question Submissions (THE FIX) ---
//         if (submissionsPayload.length > 0) {
//             const { error: submissionsError } = await supabase
//                 .from('question_submissions')
//                 .insert(submissionsPayload);

//             if (submissionsError) {
//                 console.error('Submission Error (Question Submissions):', submissionsError);
//                 // Log the error but continue to save the main result
//             }
//         }
        
//         // --- Step 3: Save Main Quiz Result ---
//         const percentageScore = (calculatedScore / questions.length) * 100;
        
//         const { error: submitError, data: resultData } = await supabase.from('quiz_results').insert({
//             user_id: userId,
//             quiz_id: quizDetails.id,
//             score: calculatedScore,
//             total_questions: questions.length,
//             percentage_score: percentageScore,
//             completion_time: completionTimeInterval, 
//             completed_at: new Date().toISOString(),
//             detailed_answers: detailedAnswers, 
//         }).select('id').maybeSingle();

//         // --- Step 4: Handle Navigation ---
//         if (submitError || !resultData) {
//             console.error('Submission Error (Quiz Result):', submitError);
//             toast({ title: "Error", description: `Failed to save main quiz result.`, variant: "destructive" });
//         } else {
//              const resultId = resultData.id;
//              toast({ title: "Quiz Complete!", description: "Your answers have been submitted.", variant: "success" });
//              navigate(`/quiz/results/${resultId}`, { replace: true });
//              return; 
//         }

//         setLoading(false);

//     }, [questions, userAnswers, quizDetails, toast, startTime, navigate, topicMap]);

//     // --- TIMER EFFECT ---
//     useEffect(() => {
//         if (!isRunning) return;

//         const timer = setInterval(() => {
//             setTimeLeft((prevTime) => {
//                 if (prevTime <= 1) {
//                     clearInterval(timer);
//                     if (prevTime === 1) { 
//                         handleSubmitQuiz(true); 
//                     }
//                     return 0;
//                 }
//                 return prevTime - 1;
//             });
//         }, 1000);

//         return () => clearInterval(timer);
//     }, [isRunning, handleSubmitQuiz]);


//     // --- DATA FETCHING EFFECT ---
//     useEffect(() => {
//         const fetchData = async () => {
//             if (!quizId) return;

//             const userSession = await supabase.auth.getSession();
//             if (!userSession.data.session) {
//                 toast({ title: "Error", description: "Please log in to start the quiz.", variant: "destructive" });
//                 navigate('/auth?mode=login');
//                 return;
//             }

//             // 2. Fetch Quiz Details
//             const { data: qData, error: qError } = await supabase
//                 .from('quizzes')
//                 .select('id, title, description, time_limit, sections') 
//                 .eq('id', quizId)
//                 .maybeSingle();

//             if (qError || !qData || !qData.sections || qData.sections.length === 0) {
//                 toast({ title: "Error", description: "Quiz is not available or has no sections defined.", variant: "destructive" });
//                 navigate('/dashboard');
//                 return;
//             }
            
//             const details = qData as QuizDetails;
//             setQuizDetails(details); 

//             // 3. Fetch Questions and Topics
//             const { data: qsData, error: qsError } = await supabase
//                 .from('questions')
//                 .select('id, question_text, options, correct_answer, quiz_section_name, topic_id') 
//                 .eq('quiz_id', quizId)
//                 .order('quiz_section_name', { ascending: true }) 
//                 .order('id', { ascending: true }); 

//             if (qsError || !qsData || qsData.length === 0) {
//                 toast({ title: "Error", description: "No questions found for this quiz.", variant: "destructive" });
//                 navigate('/dashboard');
//                 return;
//             }
            
//             // 4. Fetch Topic Map
//             const topicIds = qsData.map(q => q.topic_id).filter((id): id is string => !!id);
//             const { data: topicsData } = await supabase
//                 .from('topics')
//                 .select('id, name')
//                 .in('id', Array.from(new Set(topicIds)));
            
//             const topicMapData = (topicsData || []).reduce((acc, topic) => {
//                 acc[topic.id] = topic.name;
//                 return acc;
//             }, {} as Record<string, string>);

//             setTopicMap(topicMapData); 

//             setQuestions(qsData as Question[]);
//             const initialAnswers = qsData.reduce((acc, q) => ({ ...acc, [q.id]: null }), {});
//             setUserAnswers(initialAnswers);
            
            
//             // Set timeLeft using the helper function on fetched data
//             const durationSec = parseTimeLimitToSeconds(details.time_limit);
//             setTimeLeft(durationSec); // Set the correct, dynamic duration
            
//             setLoading(false);
//             setStartTime(new Date());
//             setIsRunning(true); 

//         };

//         fetchData();
//         return () => setIsRunning(false); 
//     }, [quizId, navigate, toast]);


//     // --- RENDERING HELPERS ---
//     const handleAnswerSelect = (questionId: string, answer: string) => {
//         if (isFinished) return;
//         setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
//     };
    
//     const handleSectionJump = (sectionName: string) => {
//         const firstIndexInSection = questions.findIndex(q => q.quiz_section_name === sectionName);
//         if (firstIndexInSection !== -1) {
//             setCurrentQuestionIndex(firstIndexInSection);
//         }
//     };


//     // --- RENDER LOGIC ---

//     if (loading || !quizDetails || questions.length === 0) {
//         return (
//             <div className="flex min-h-screen items-center justify-center">
//                 <p className="text-muted-foreground">Loading Quiz, please wait...</p>
//             </div>
//         );
//     }
    
//     const currentQuestion = questions[currentQuestionIndex];
//     const isLastQuestion = currentQuestionIndex === questions.length - 1;
//     const currentAnswer = userAnswers[currentQuestion.id];
//     const questionsPerSection = questions.reduce((acc, q) => {
//         acc[q.quiz_section_name] = (acc[q.quiz_section_name] || 0) + 1;
//         return acc;
//     }, {} as Record<string, number>);

//     // If quiz is finished, the logic should have navigated away via handleSubmitQuiz
//     // Adding a fallback check to prevent rendering quiz controls if navigation failed
//     if (isFinished && !loading) {
//          return (
//              <div className="flex min-h-screen items-center justify-center">
//                  <p className="text-muted-foreground">Submitting results...</p>
//              </div>
//          );
//     }


//     return (
//         <div className="min-h-screen bg-gradient-to-b from-background to-muted pt-8">
//             <div className="container mx-auto max-w-6xl flex space-x-6">
                
//                 {/* 1. Sidebar/Navigation */}
//                 <Card className="w-1/4 h-fit sticky top-8 shadow-lg hidden lg:block">
//                     <CardHeader className="p-4 border-b">
//                         <CardTitle className="text-lg">Quiz Structure</CardTitle>
//                     </CardHeader>
//                     <CardContent className="p-4 space-y-3">
//                         {quizDetails.sections.map((sectionName) => (
//                             <div 
//                                 key={sectionName}
//                                 onClick={() => handleSectionJump(sectionName)}
//                                 className={`cursor-pointer p-2 rounded-lg transition-colors 
//                                     ${currentQuestion.quiz_section_name === sectionName 
//                                         ? 'bg-primary text-primary-foreground font-semibold shadow-md' 
//                                         : 'hover:bg-muted/70'
//                                     }`}
//                             >
//                                 <div className="flex justify-between items-center text-sm">
//                                     <span>{sectionName}</span>
//                                     <span className={`px-2 py-0.5 rounded ${currentQuestion.quiz_section_name === sectionName ? 'bg-primary-foreground text-primary' : 'bg-muted'}`}>
//                                         {questionsPerSection[sectionName] || 0} Qs
//                                     </span>
//                                 </div>
//                             </div>
//                         ))}
//                     </CardContent>
//                 </Card>

//                 {/* 2. Main Question Area */}
//                 <div className="w-full lg:w-3/4 space-y-6">
                    
//                     {/* Header/Timer */}
//                     <div className="flex justify-between items-center p-4 rounded-lg bg-card shadow-md">
//                         <h1 className="text-xl font-bold">{quizDetails.title}</h1>
                        
//                         <div className="text-sm font-medium px-3 py-1 bg-secondary rounded-full">
//                             Section: {currentQuestion.quiz_section_name}
//                         </div>

//                         <div className={`flex items-center space-x-2 font-mono text-xl ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
//                             <Clock className="h-5 w-5" />
//                             <span>{formatTime(timeLeft)}</span>
//                         </div>
//                     </div>

//                     {/* Question Card */}
//                     <Card className="shadow-2xl">
//                         <CardHeader>
//                             <CardTitle className="text-lg">
//                                 Question {currentQuestionIndex + 1} of {questions.length}
//                             </CardTitle>
//                             <CardDescription className="text-base text-gray-700">
//                                 {currentQuestion.question_text}
//                             </CardDescription>
//                         </CardHeader>
                        
//                         <CardContent className="space-y-4">
//                             {/* Options */}
//                             {currentQuestion.options.map((option, index) => (
//                                 <div
//                                     key={index}
//                                     className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center space-x-3 ${
//                                         currentAnswer === option 
//                                             ? 'bg-primary text-primary-foreground border-primary shadow-md' 
//                                             : 'hover:bg-muted/50'
//                                     }`}
//                                     onClick={() => handleAnswerSelect(currentQuestion.id, option)}
//                                 >
//                                     {currentAnswer === option ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
//                                     <span className="font-medium flex-grow">{option}</span>
//                                 </div>
//                             ))}
//                         </CardContent>
                        
//                         <CardFooter className="flex justify-between border-t pt-4">
//                             <Button 
//                                 onClick={() => setCurrentQuestionIndex(prev => prev - 1)} 
//                                 disabled={currentQuestionIndex === 0} 
//                                 variant="outline"
//                             >
//                                 Previous
//                             </Button>
                            
//                             <Button 
//                                 onClick={isLastQuestion ? () => handleSubmitQuiz(false) : () => setCurrentQuestionIndex(prev => prev + 1)}
//                                 disabled={!currentAnswer && !isLastQuestion} 
//                             >
//                                 {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
//                             </Button>
//                         </CardFooter>
//                     </Card>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default QuizPage;




// src/pages/QuizPage.tsx

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Clock, CheckCircle, List, Square, CheckSquare } from "lucide-react";

// --- TYPES (Unchanged) ---
type Question = {
    id: string;
    question_text: string;
    options: string[];
    correct_answer: string;
    quiz_section_name: string; 
    topic_id: string | null;
};

type QuizDetails = {
    id: string;
    title: string;
    description: string;
    time_limit: string | null;
    sections: string[];       
};
// --- END TYPES ---


const QuizPage = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    
    // Quiz Flow State
    const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [topicMap, setTopicMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<string, string | null>>({});
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);
    
    // Timer State
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [timeLeft, setTimeLeft] = useState(0); 
    const [isRunning, setIsRunning] = useState(false);
    
    // --- UTILITIES (Unchanged) ---
    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const parseTimeLimitToSeconds = (timeLimit: string | null): number => {
        if (!timeLimit) return 0;
        let totalSeconds = 0;
        const timeMatch = timeLimit.match(/(\d+):(\d{2}):(\d{2})/);
        if (timeMatch) {
            const hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            const seconds = parseInt(timeMatch[3]);
            totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
        } else {
            const parts = timeLimit.split(/\s+/);
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                const nextPart = parts[i + 1];
                if (!isNaN(Number(part))) {
                    const value = parseInt(part);
                    if (nextPart?.startsWith('min')) {
                        totalSeconds += value * 60;
                    } else if (nextPart?.startsWith('hour')) {
                        totalSeconds += value * 3600;
                    }
                }
            }
        }
        return totalSeconds > 0 ? totalSeconds : (timeLimit ? 1800 : 0); 
    };
    
    // --- SUBMISSION LOGIC (THE DEFINITIVE FIX) ---
    const handleSubmitQuiz = useCallback(async (isTimedOut: boolean) => {
        setIsRunning(false);
        setLoading(true);

        const endTime = new Date();
        const userSession = await supabase.auth.getSession();
        const userId = userSession.data.session?.user.id;

        if (!userId || !quizDetails) {
            toast({ title: "Error", description: "User session or quiz data missing.", variant: "destructive" });
            setLoading(false);
            return;
        }

        const durationMs = startTime ? endTime.getTime() - startTime.getTime() : 0;
        const completionTimeInterval = `${Math.floor(durationMs / 1000)} seconds`;
        const percentageScore = (score / questions.length) * 100;

        // --- 1. Create Master Quiz Attempt Record to get a unique ID ---
        const { data: attemptData, error: attemptError } = await supabase.from('quiz_attempts')
            .insert({
                user_id: userId,
                quiz_id: quizDetails.id,
                completed_at: endTime.toISOString(),
                score_percentage: percentageScore,
            }).select('id').single();

        if (attemptError || !attemptData) {
            console.error('Master Attempt Insertion Failed:', attemptError);
            toast({ 
                title: "Critical Error", 
                description: `Failed to start quiz submission. ${attemptError?.message}`, 
                variant: "destructive" 
            });
            setLoading(false);
            return;
        }
        const quizAttemptId = attemptData.id;
        
        let calculatedScore = 0;
        const submissionsPayload: any[] = [];
        const detailedAnswers: any[] = [];

        // --- 2. Build Submissions and Results Payloads ---
        questions.forEach(question => {
            const userAnswer = userAnswers[question.id];
            const isCorrect = userAnswer === question.correct_answer;
            
            if (isCorrect) {
                calculatedScore += 1;
            }
            
            // Payload for 'question_submissions' (Weakness Tracking)
            if (question.topic_id) {
                submissionsPayload.push({
                    user_id: userId,
                    question_id: question.id,
                    is_correct: isCorrect,
                    quiz_attempt_id: quizAttemptId, // IMPORTANT: Now using the unique ID
                });
            }

            // Payload for 'quiz_results' detailed_answers (UI display)
            const topicName = question.topic_id ? topicMap[question.topic_id] : 'General';
            detailedAnswers.push({
                question_id: question.id,
                question_text: question.question_text,
                quiz_section_name: question.quiz_section_name,
                topic_name: topicName, 
                user_answer: userAnswer,
                correct_answer: question.correct_answer,
                is_correct: isCorrect,
            });
        });

        // --- 3. Save Individual Question Submissions (Batch Insert) ---
        if (submissionsPayload.length > 0) {
            const { error: submissionsError } = await supabase
                .from('question_submissions')
                .insert(submissionsPayload);

            if (submissionsError) {
                console.error('Submission Error (Question Submissions):', submissionsError);
                toast({ 
                    title: "Progress Tracking Failed", 
                    description: `Cannot save detailed topic data. RLS or schema error: ${submissionsError.message}`, 
                    variant: "destructive" 
                });
                // DO NOT RETURN. Continue to save the main result.
            }
        }
        
        // --- 4. Save Main Quiz Result (Optional: Keep for UI) ---
        // (Assuming you still have a 'quiz_results' table for UI)
        const { error: submitError, data: resultData } = await supabase.from('quiz_results').insert({
            user_id: userId,
            quiz_id: quizDetails.id,
            score: calculatedScore,
            total_questions: questions.length,
            percentage_score: (calculatedScore / questions.length) * 100,
            completion_time: completionTimeInterval, 
            completed_at: endTime.toISOString(),
            detailed_answers: detailedAnswers, 
        }).select('id').maybeSingle();

        // --- 5. Handle Navigation ---
        if (submitError || !resultData) {
            console.error('Submission Error (Quiz Result):', submitError);
            toast({ title: "Error", description: `Failed to save main quiz result.`, variant: "destructive" });
        } else {
             const resultId = resultData.id;
             toast({ title: "Quiz Complete!", description: "Your answers have been submitted.", variant: "success" });
             navigate(`/quiz/results/${resultId}`, { replace: true });
             return; 
        }

        setLoading(false);

    }, [questions, userAnswers, quizDetails, toast, startTime, navigate, topicMap, score]); // Added 'score' dependency as it's used in percentageScore calculation

    // --- TIMER EFFECT (Unchanged) ---
    useEffect(() => {
        if (!isRunning) return;
        // ... (timer logic)
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    if (prevTime === 1) { 
                        handleSubmitQuiz(true); 
                    }
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, handleSubmitQuiz]);


    // --- DATA FETCHING EFFECT (Unchanged) ---
    useEffect(() => {
        const fetchData = async () => {
            if (!quizId) return;

            const userSession = await supabase.auth.getSession();
            if (!userSession.data.session) {
                toast({ title: "Error", description: "Please log in to start the quiz.", variant: "destructive" });
                navigate('/auth?mode=login');
                return;
            }

            // ... (Quiz details, Questions, and Topics fetching logic)
            
            const { data: qData, error: qError } = await supabase
                .from('quizzes')
                .select('id, title, description, time_limit, sections') 
                .eq('id', quizId)
                .maybeSingle();

            if (qError || !qData || !qData.sections || qData.sections.length === 0) {
                toast({ title: "Error", description: "Quiz is not available or has no sections defined.", variant: "destructive" });
                navigate('/dashboard');
                return;
            }
            
            const details = qData as QuizDetails;
            setQuizDetails(details); 

            const { data: qsData, error: qsError } = await supabase
                .from('questions')
                .select('id, question_text, options, correct_answer, quiz_section_name, topic_id') 
                .eq('quiz_id', quizId)
                .order('quiz_section_name', { ascending: true }) 
                .order('id', { ascending: true }); 

            if (qsError || !qsData || qsData.length === 0) {
                toast({ title: "Error", description: "No questions found for this quiz.", variant: "destructive" });
                navigate('/dashboard');
                return;
            }
            
            const topicIds = qsData.map(q => q.topic_id).filter((id): id is string => !!id);
            const { data: topicsData } = await supabase
                .from('topics')
                .select('id, name')
                .in('id', Array.from(new Set(topicIds)));
            
            const topicMapData = (topicsData || []).reduce((acc, topic) => {
                acc[topic.id] = topic.name;
                return acc;
            }, {} as Record<string, string>);

            setTopicMap(topicMapData); 
            setQuestions(qsData as Question[]);
            
            const initialAnswers = qsData.reduce((acc, q) => ({ ...acc, [q.id]: null }), {});
            setUserAnswers(initialAnswers);
            
            const durationSec = parseTimeLimitToSeconds(details.time_limit);
            setTimeLeft(durationSec);
            
            setLoading(false);
            setStartTime(new Date());
            setIsRunning(true); 
        };

        fetchData();
        return () => setIsRunning(false); 
    }, [quizId, navigate, toast]);


    // --- RENDERING HELPERS (Unchanged) ---
    const handleAnswerSelect = (questionId: string, answer: string) => {
        if (isFinished) return;
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    };
    
    const handleSectionJump = (sectionName: string) => {
        const firstIndexInSection = questions.findIndex(q => q.quiz_section_name === sectionName);
        if (firstIndexInSection !== -1) {
            setCurrentQuestionIndex(firstIndexInSection);
        }
    };


    // --- RENDER LOGIC (Unchanged) ---
    if (loading || !quizDetails || questions.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">Loading Quiz, please wait...</p>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const currentAnswer = userAnswers[currentQuestion.id];
    const questionsPerSection = questions.reduce((acc, q) => {
        acc[q.quiz_section_name] = (acc[q.quiz_section_name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    if (isFinished && !loading) {
         return (
             <div className="flex min-h-screen items-center justify-center">
                 <p className="text-muted-foreground">Submitting results...</p>
             </div>
         );
    }


    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted pt-8">
            <div className="container mx-auto max-w-6xl flex space-x-6">
                
                {/* 1. Sidebar/Navigation */}
                <Card className="w-1/4 h-fit sticky top-8 shadow-lg hidden lg:block">
                    <CardHeader className="p-4 border-b">
                        <CardTitle className="text-lg">Quiz Structure</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        {quizDetails.sections.map((sectionName) => (
                            <div 
                                key={sectionName}
                                onClick={() => handleSectionJump(sectionName)}
                                className={`cursor-pointer p-2 rounded-lg transition-colors 
                                    ${currentQuestion.quiz_section_name === sectionName 
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-md' 
                                        : 'hover:bg-muted/70'
                                    }`}
                            >
                                <div className="flex justify-between items-center text-sm">
                                    <span>{sectionName}</span>
                                    <span className={`px-2 py-0.5 rounded ${currentQuestion.quiz_section_name === sectionName ? 'bg-primary-foreground text-primary' : 'bg-muted'}`}>
                                        {questionsPerSection[sectionName] || 0} Qs
                                    </span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 2. Main Question Area */}
                <div className="w-full lg:w-3/4 space-y-6">
                    
                    {/* Header/Timer */}
                    <div className="flex justify-between items-center p-4 rounded-lg bg-card shadow-md">
                        <h1 className="text-xl font-bold">{quizDetails.title}</h1>
                        
                        <div className="text-sm font-medium px-3 py-1 bg-secondary rounded-full">
                            Section: {currentQuestion.quiz_section_name}
                        </div>

                        <div className={`flex items-center space-x-2 font-mono text-xl ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
                            <Clock className="h-5 w-5" />
                            <span>{formatTime(timeLeft)}</span>
                        </div>
                    </div>

                    {/* Question Card */}
                    <Card className="shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </CardTitle>
                            <CardDescription className="text-base text-gray-700">
                                {currentQuestion.question_text}
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                            {/* Options */}
                            {currentQuestion.options.map((option, index) => (
                                <div
                                    key={index}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center space-x-3 ${
                                        currentAnswer === option 
                                            ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                                            : 'hover:bg-muted/50'
                                    }`}
                                    onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                                >
                                    {currentAnswer === option ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                                    <span className="font-medium flex-grow">{option}</span>
                                </div>
                            ))}
                        </CardContent>
                        
                        <CardFooter className="flex justify-between border-t pt-4">
                            <Button 
                                onClick={() => setCurrentQuestionIndex(prev => prev - 1)} 
                                disabled={currentQuestionIndex === 0} 
                                variant="outline"
                            >
                                Previous
                            </Button>
                            
                            <Button 
                                onClick={isLastQuestion ? () => handleSubmitQuiz(false) : () => setCurrentQuestionIndex(prev => prev + 1)}
                                disabled={!currentAnswer && !isLastQuestion} 
                            >
                                {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default QuizPage;