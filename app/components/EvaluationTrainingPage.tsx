"use client";
import { ArrowRight, CheckCircle2, Lightbulb, ShieldCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { EvaluationFigure } from './EvaluationFigure';
import { evaluationNodes, getEvaluationSteps } from '../content/evaluationTrail';
import { advanceEvaluation, createEvaluationSession, evaluationMetrics, nodeMetrics, startEvaluationNode } from '../engine/evaluation';
import type { useProgress } from '../hooks/useProgress';

export function EvaluationTrainingPage({ controller, onMap }: { controller: Pick<ReturnType<typeof useProgress>, 'progress' | 'saveEvaluationSession' | 'submitEvaluationResponse'>; onMap: () => void }) {
  const { progress, saveEvaluationSession, submitEvaluationResponse } = controller;
  const heading = useRef<HTMLHeadingElement>(null);
  const session = progress.evaluationSession;
  useEffect(() => {
    if (!session) saveEvaluationSession(createEvaluationSession(crypto.randomUUID()));
  }, [session, saveEvaluationSession]);
  useEffect(() => { heading.current?.focus(); }, [session?.currentChallengeId, session?.phase]);
  if (!session) return <p role="status">Abrindo sua trilha…</p>;
  const node = evaluationNodes[session.nodeIndex]!;
  const steps = getEvaluationSteps(session.nodeIndex, session.variant);
  const step = steps[session.stepIndex];
  const metrics = evaluationMetrics(session);
  const checkpoint = nodeMetrics(session, session.nodeIndex);
  const feedback = session.phase === 'feedback';
  const currentAttempt = session.attempts.find(attempt => attempt.challengeId === session.currentChallengeId);
  const setResponse = (response: string[]) => saveEvaluationSession({ ...session, response });
  const submit = () => submitEvaluationResponse(session.response);
  const advance = () => {
    const next = advanceEvaluation(session);
    saveEvaluationSession(next);
  };
  const canSubmit = step?.kind === 'vf' ? session.response.length === 2 && session.response.every(Boolean) : Boolean(session.response[0]?.trim());
  return <section className="page evaluation-page">
    <header className="evaluation-hero"><div><span className="eyebrow">Campanha · IFSP Cubatão</span>
      <h1>Treino da 1ª Avaliação — IFSP</h1><p>Entenda, construa, justifique e transfira. Seu lugar na trilha fica salvo neste navegador.</p></div></header>
    <div className="evaluation-metrics" aria-label="Progresso da trilha">
      <span>Conteúdo concluído <strong data-testid="content-metric">{metrics.content}%</strong></span>
      <span>Praticado <strong data-testid="practice-metric">{metrics.practiced}%</strong></span>
      <span>Domínio na trilha <strong data-testid="mastery-metric">{metrics.mastery}%</strong></span>
    </div>
    <p className="evaluation-metric-note">Ler conclui conteúdo. Responder registra prática. Domínio exige solução e justificativa sem dica, confirmadas em outra configuração. O perfil geral combina também suas outras atividades.</p>
    <ol className="evaluation-path" aria-label="Etapas da avaliação">{evaluationNodes.map((item, index) => <li key={item.id}
      className={session.nodeIndex === index && session.phase !== 'done' ? 'is-current' : session.completedNodeIds.includes(item.id) ? 'is-complete' : ''}
      aria-current={session.nodeIndex === index && session.phase !== 'done' ? 'step' : undefined}><span>{session.completedNodeIds.includes(item.id) ? '✓' : index + 1}</span>{item.title}</li>)}</ol>
    <article className="evaluation-card" data-testid="evaluation-workbench" data-challenge-id={session.currentChallengeId}>
      {session.phase === 'done' ? <><ShieldCheck size={32} /><h2 ref={heading} tabIndex={-1}>Trilha concluída</h2>
        <p>Seção concluída 100% · {metrics.mastered}/6 habilidades com transferência independente.</p>
        <ul>{evaluationNodes.map((item, index) => <li key={item.id}>{item.title}: {nodeMetrics(session, index).mastered ? 'dominado nesta trilha' : 'praticado — ainda precisa de evidência independente'}</li>)}</ul>
        <p>Seu histórico e domínio geral foram atualizados com cada tentativa.</p>
        <button className="button button--primary" type="button" onClick={onMap}>Voltar ao mapa</button></>
      : session.phase === 'content' ? <><span className="eyebrow">Etapa {session.nodeIndex+1}/6 · Entenda</span>
        <h2 ref={heading} tabIndex={-1}>{node.title}</h2>{node.lesson.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
        {session.nodeIndex===0 && <label className="evaluation-convention">Convenção de trapézio nesta trilha
          <select value={session.trapezoidConvention} onChange={event => saveEvaluationSession({ ...session, trapezoidConvention: event.target.value as 'exclusive' | 'inclusive' })}>
            <option value="exclusive">Exclusiva: exatamente um par de lados opostos paralelos</option>
            <option value="inclusive">Inclusiva: pelo menos um par de lados opostos paralelos</option>
          </select><small>Nas duas convenções, existem trapézios que não são paralelogramos.</small></label>}
        <EvaluationFigure session={session}/><button className="button button--primary" type="button" onClick={() => saveEvaluationSession(startEvaluationNode(session))}>Começar prática <ArrowRight size={16}/></button></>
      : session.phase === 'checkpoint' ? <><CheckCircle2 size={30}/><h2 ref={heading} tabIndex={-1}>Checkpoint: {node.title}</h2>
        <p>Seção concluída 100% · Domínio {checkpoint.mastery}%</p><p>{checkpoint.mastered ? 'Você resolveu e justificou a habilidade com transferência independente.' : 'Você percorreu o bloco. Erros ou dicas ainda limitam a evidência de domínio; a próxima etapa está disponível.'}</p>
        {(session.nodeIndex===2 || session.nodeIndex===3 || session.nodeIndex===5) && checkpoint.transferPassed && <details><summary>Ver a prova construída na transferência</summary><ol>{getEvaluationSteps(session.nodeIndex,session.variant).map(item=><li key={item.id}>{item.answer.join(' — ')}. {item.explanation}</li>)}</ol></details>}
        <button type="button" className="button button--primary" onClick={advance}>{session.nodeIndex===5?'Concluir trilha':'Próxima habilidade'} <ArrowRight size={16}/></button></>
      : step && <><span className="eyebrow">{node.title} · {session.variant===0?'Prática':session.variant===1?'Transferência':'Nova configuração'} · Passo {session.stepIndex+1}/{steps.length}</span>
        {session.remediationReason && <p className="evaluation-remediation">{session.remediationReason}</p>}
        {session.variant===1 && <p className="evaluation-transfer">Agora aplique a mesma ideia com {session.nodeIndex===4?'novos valores':'outra figura e nomeação'}, sem receber a solução antes de responder.</p>}
        <h2 ref={heading} tabIndex={-1}>{step.prompt}</h2><EvaluationFigure session={session} step={step}/>
        {step.kind==='vf' && <p className="evaluation-convention">Isósceles: pelo menos dois lados congruentes. Trapézio: {session.trapezoidConvention==='exclusive'?'exatamente um':'pelo menos um'} par de lados opostos paralelos.</p>}
        {step.kind==='number' ? <label className="evaluation-number">Resposta em metros<input aria-label="Resposta em metros" inputMode="decimal" value={session.response[0]??''} disabled={feedback} onChange={event=>setResponse([event.target.value])}/></label>
          : <fieldset className="evaluation-options"><legend>{step.kind==='vf'?'Verdadeiro ou falso':'Escolha o próximo passo ou a justificativa'}</legend>{step.options.map(option=><button type="button" key={option}
            disabled={feedback} aria-pressed={session.response[0]===option} className={session.response[0]===option?'is-selected':''}
            onClick={()=>setResponse([option,...session.response.slice(1)])}>{option}</button>)}</fieldset>}
        {step.reasons && <fieldset className="evaluation-options"><legend>Justificativa ou contraexemplo</legend>{step.reasons.map(reason=><button type="button" key={reason} disabled={feedback}
          aria-pressed={session.response[1]===reason} className={session.response[1]===reason?'is-selected':''} onClick={()=>setResponse([session.response[0]??'',reason])}>{reason}</button>)}</fieldset>}
        {!feedback && <button type="button" className="evaluation-hint" onClick={()=>saveEvaluationSession({...session,hintsUsed:1,independence:.7})}>
          <Lightbulb size={16}/>{session.hintsUsed?step.hint:'Pedir uma dica'}</button>}
        {feedback && <div className={`evaluation-feedback ${currentAttempt?.correct?'is-correct':'is-wrong'}`} role="status">
          <div><strong>{currentAttempt?.correct?'Passo validado':'Primeiro ponto a corrigir'}</strong><p>{step.explanation}</p>
            {!currentAttempt?.correct && <p>Sua tentativa foi registrada. Você segue agora e encontrará uma nova configuração no fechamento do bloco.</p>}</div></div>}
        <div className="evaluation-footer">{feedback ? <button type="button" className="button button--primary" onClick={advance}>Próxima <ArrowRight size={16}/></button>
          : <button type="button" className="button button--primary" disabled={!canSubmit} onClick={submit}>{step.kind==='construction'?'Realizar construção':'Validar resposta'}</button>}
          <span>{session.hintsUsed?'Com apoio: dica solicitada':'Sem dica solicitada'}</span></div></>}
    </article>
    <footer className="evaluation-source"><strong>Fonte de treino</strong><span>1ª Avaliação de Geometria Euclidiana Plana · Prof. Leandro Albino Mosca Rodrigues · IFSP Cubatão. Adaptação interativa dos enunciados fornecidos; variantes de transferência elaboradas para esta trilha.</span></footer>
  </section>;
}
