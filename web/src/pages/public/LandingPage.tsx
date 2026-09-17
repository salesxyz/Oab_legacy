import { PublicHeader } from '../../layouts/public/PublicHeader';
import { PublicFooter } from '../../layouts/public/PublicFooter';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { HowItWorks } from './sections/HowItWorks';
import { ExamJourney } from './sections/ExamJourney';
import { Disciplines } from './sections/Disciplines';
import { Plans } from './sections/Plans';
import { Faq } from './sections/Faq';
import { FinalCta } from './sections/FinalCta';

export function LandingPage() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <PublicHeader />
      <main id="conteudo">
        <Hero />
        <Features />
        <HowItWorks />
        <ExamJourney />
        <Disciplines />
        <Plans />
        <Faq />
        <FinalCta />
      </main>
      <PublicFooter />
    </>
  );
}
