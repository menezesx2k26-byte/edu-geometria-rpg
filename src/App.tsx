import { Component, lazy, Suspense, useEffect, type ErrorInfo, type ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/navigation/AppShell';

const MapPage = lazy(() => import('./pages/MapPage').then((module) => ({ default: module.MapPage })));
const EncounterPage = lazy(() => import('./pages/EncounterPage').then((module) => ({ default: module.EncounterPage })));
const CodexPage = lazy(() => import('./pages/CodexPage').then((module) => ({ default: module.CodexPage })));
const ReviewPage = lazy(() => import('./pages/ReviewPage').then((module) => ({ default: module.ReviewPage })));
const TrainingPage = lazy(() => import('./pages/TrainingPage').then((module) => ({ default: module.TrainingPage })));
const ProofPage = lazy(() => import('./pages/ProofPage').then((module) => ({ default: module.ProofPage })));
const MicroquestPage = lazy(() => import('./pages/MicroquestPage').then((module) => ({ default: module.MicroquestPage })));
const CampaignPage = lazy(() => import('./pages/CampaignPage').then((module) => ({ default: module.CampaignPage })));
const AnalyticalCampaignPage = lazy(() => import('./pages/AnalyticalCampaignPage').then((module) => ({ default: module.AnalyticalCampaignPage })));
const CoordinateLabPage = lazy(() => import('./pages/CoordinateLabPage').then((module) => ({ default: module.CoordinateLabPage })));
const OfficialQuest15Page = lazy(() => import('./pages/OfficialQuest15Page').then((module) => ({ default: module.OfficialQuest15Page })));
const VerticalSlicePage = lazy(() => import('./pages/VerticalSlicePage').then((module) => ({ default: module.VerticalSlicePage })));
const LineForgePage = lazy(() => import('./pages/LineForgePage').then((module) => ({ default: module.LineForgePage })));
const MetricModelingPage = lazy(() => import('./pages/MetricModelingPage').then((module) => ({ default: module.MetricModelingPage })));
const ParallelismLabPage = lazy(() => import('./pages/ParallelismLabPage').then((module) => ({ default: module.ParallelismLabPage })));
const CrossoverPage = lazy(() => import('./pages/CrossoverPage').then((module) => ({ default: module.CrossoverPage })));
const CorrespondenceLessonPage = lazy(() => import('./pages/CorrespondenceLessonPage').then((module) => ({ default: module.CorrespondenceLessonPage })));
const DidacticLessonPage = lazy(() => import('./pages/DidacticLessonPage').then((module) => ({ default: module.DidacticLessonPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage').then((module) => ({ default: module.AchievementsPage })));
const EvaluationTrainingPage = lazy(() => import('./pages/EvaluationTrainingPage').then((module) => ({ default: module.EvaluationTrainingPage })));

function PageLoader() {
  return <div className="page-loader" role="status" aria-live="polite">Abrindo território…</div>;
}

function RouteEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

function NotFoundPage() {
  return (
    <section className="page empty-page not-found-page">
      <span className="eyebrow">Rota desconhecida</span>
      <h1>Esse território não existe no mapa.</h1>
      <p>O endereço pode ter mudado ou a missão ainda não foi liberada.</p>
      <Link className="primary-action" to="/map">Voltar ao caminho</Link>
    </section>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Falha não tratada no Geometria RPG', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="page empty-page error-page" role="alert">
          <span className="eyebrow">Falha de execução</span>
          <h1>O território encontrou um erro inesperado.</h1>
          <p>Seu progresso local não foi apagado. Recarregue a aplicação para reconstruir a interface.</p>
          <button type="button" className="primary-action" onClick={() => window.location.reload()}>Recarregar aplicação</button>
        </section>
      );
    }

    return this.props.children;
  }
}

export function App() {
  return (
    <AppErrorBoundary>
      <RouteEffects />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/map" replace />} />
            <Route path="map" element={<MapPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="lesson/:id" element={<DidacticLessonPage />} />
            <Route path="mission/ordered-correspondence" element={<CorrespondenceLessonPage />} />
            <Route path="encounter/official-q15" element={<OfficialQuest15Page />} />
            <Route path="encounter/:id" element={<EncounterPage />} />
            <Route path="codex" element={<CodexPage />} />
            <Route path="codex/:id" element={<CodexPage />} />
            <Route path="training" element={<TrainingPage />} />
            <Route path="avaliacao-ifsp" element={<EvaluationTrainingPage />} />
            <Route path="proof/:id" element={<ProofPage />} />
            <Route path="microquest/:id" element={<MicroquestPage />} />
            <Route path="campaign/euclidean" element={<CampaignPage />} />
            <Route path="campaign/euclidean/:regionId" element={<CampaignPage />} />
            <Route path="campaign/euclidean/:regionId/:questId" element={<CampaignPage />} />
            <Route path="campaign/analytical" element={<AnalyticalCampaignPage />} />
            <Route path="campaign/analytical/:regionId" element={<AnalyticalCampaignPage />} />
            <Route path="campaign/analytical/:regionId/:questId" element={<AnalyticalCampaignPage />} />
            <Route path="lab/coordinates" element={<CoordinateLabPage />} />
            <Route path="lab/line-forge" element={<LineForgePage />} />
            <Route path="lab/exercise-48" element={<MetricModelingPage />} />
            <Route path="lab/parallelism" element={<ParallelismLabPage />} />
            <Route path="lab/crossover" element={<CrossoverPage />} />
            <Route path="vertical-slice" element={<VerticalSlicePage />} />
            <Route path="review" element={<ReviewPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  );
}
