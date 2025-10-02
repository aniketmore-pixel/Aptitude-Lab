import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/user/UserDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import QuizManagement from "./pages/Admin/QuizManagement";
import QuizForm from "./pages/Admin/QuizForm";
import QuestionForm from "./pages/admin/QuestionForm";
import QuestionList from "./pages/admin/QuestionList";
import QuizPage from "./pages/QuizPage";
import ReportsPage from "./pages/admin/ReportsPage";
import QuizResultsPage from "./pages/QuizResultsPage";
import TopicManagement from "./pages/admin/TopicManagement";
import QuizSectionManager from "./pages/admin/QuizSectionManager";
import UserReportsPage from "./pages/UserReportsPage";
import WeaknessSets from "./pages/user/WeaknessSets";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/quizzes" element={<QuizManagement />} />
          <Route path="/admin/quizzes/edit/:quizId" element={<QuizForm />} />
          <Route path="/admin/quizzes/new" element={<QuizForm />} />
          <Route path="/admin/questions/new" element={<QuestionForm />} />
          <Route path="/admin/questions/edit/:questionId" element={<QuestionForm />} />
          <Route path="/admin/quizzes/questions/:quizId" element={<QuizSectionManager />} />
          <Route path="/admin/questions" element={<QuestionList />} />
          <Route path="/quiz/:quizId" element={<QuizPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/quiz/results/:resultId" element={<QuizResultsPage />} />
          <Route path="/user/reports" element={<UserReportsPage />} />
          <Route path="/admin/topics" element={<TopicManagement />} />
          <Route path="/user/weakness" element={<WeaknessSets />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
