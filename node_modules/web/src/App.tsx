import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './layouts/aluno/AppLayout';

import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

import { DashboardPage } from './pages/aluno/DashboardPage';
import { CoursesPage } from './pages/aluno/CoursesPage';
import { CourseDetailPage } from './pages/aluno/CourseDetailPage';
import { ModulePage } from './pages/aluno/ModulePage';
import { ContentPage } from './pages/aluno/ContentPage';
import { QuestionsPage } from './pages/aluno/QuestionsPage';
import { QuestionDetailPage } from './pages/aluno/QuestionDetailPage';
import { SimulationsPage } from './pages/aluno/SimulationsPage';
import { SimulationRunnerPage } from './pages/aluno/SimulationRunnerPage';
import { RankingPage } from './pages/aluno/RankingPage';
import { ProfilePage } from './pages/aluno/ProfilePage';
import { SubscriptionPage } from './pages/aluno/SubscriptionPage';
import { BackofficeLayout } from './layouts/backoffice/BackofficeLayout';
import { AdminDashboardPage } from './pages/backoffice/AdminDashboardPage';
import { AdminResourcePage, type AdminResource } from './pages/backoffice/AdminResourcePage';
import { ProfessorDashboardPage } from './pages/backoffice/ProfessorDashboardPage';
import { ProfessorResourcePage, type ProfessorResource } from './pages/backoffice/ProfessorResourcePage';
import { BackofficeProfilePage } from './pages/backoffice/BackofficeProfilePage';
import { MentorStudentsPage } from './pages/backoffice/MentorStudentsPage';
import { MentorSimulationPage } from './pages/backoffice/MentorSimulationPage';
import { MentorSubjectsPage } from './pages/backoffice/MentorSubjectsPage';
import { ProfessorAuthoringPage } from './pages/backoffice/ProfessorAuthoringPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route path="/entrar" element={<LoginPage />} />
            <Route path="/cadastro" element={<RegisterPage />} />
            <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/app" element={<DashboardPage />} />
                <Route path="/app/cursos" element={<CoursesPage />} />
                <Route path="/app/cursos/:courseId" element={<CourseDetailPage />} />
                <Route path="/app/cursos/:courseId/modulos/:moduleId" element={<ModulePage />} />
                <Route path="/app/cursos/:courseId/modulos/:moduleId/conteudos/:contentId" element={<ContentPage />} />
                <Route path="/app/questoes" element={<QuestionsPage />} />
                <Route path="/app/questoes/:questionId" element={<QuestionDetailPage />} />
                <Route path="/app/simulados" element={<SimulationsPage />} />
                <Route path="/app/simulados/:simulationId" element={<SimulationRunnerPage />} />
                <Route path="/app/ranking" element={<RankingPage />} />
                <Route path="/app/perfil" element={<ProfilePage />} />
                <Route path="/app/assinatura" element={<SubscriptionPage />} />
              </Route>
              <Route element={<BackofficeLayout />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/usuarios" element={<AdminResourcePage resource={'usuarios' satisfies AdminResource} />} />
                <Route path="/admin/perfil" element={<BackofficeProfilePage />} />
                <Route path="/professor" element={<ProfessorDashboardPage />} />
                <Route path="/professor/alunos" element={<MentorStudentsPage />} />
                <Route path="/professor/materias" element={<MentorSubjectsPage />} />
                <Route path="/professor/aulas" element={<ProfessorAuthoringPage mode="conteudos" />} />
                <Route path="/professor/questoes" element={<ProfessorAuthoringPage mode="questoes" />} />
                <Route path="/professor/simulados" element={<MentorSimulationPage />} />
                <Route path="/professor/desempenho" element={<ProfessorResourcePage resource={'desempenho' satisfies ProfessorResource} />} />
                <Route path="/professor/perfil" element={<BackofficeProfilePage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
