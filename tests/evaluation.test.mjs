import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluationNodes, getEvaluationSteps, generateRamp } from '../app/content/evaluationTrail.ts';
import { advanceEvaluation, answerEvaluation, createEvaluationSession, evaluationMetrics, recordEvaluationResponse, startEvaluationNode, validateEvaluationSession } from '../app/engine/evaluation.ts';
import { initialProgress, migrateProgress } from '../app/engine/progress.ts';
import { createSession } from '../app/engine/training.ts';
const fresh = () => ({...migrateProgress(initialProgress), evaluationSession:startEvaluationNode(createEvaluationSession('test'))});

test('ramp original uses 2+6=8 and h=4; variants are deterministic and consistent',()=>{
  assert.deepEqual(generateRamp(0),{small:2,remaining:6,whole:8,height:1,solution:4});
  for(let seed=0;seed<80;seed++){
    const r=generateRamp(seed);assert.deepEqual(r,generateRamp(seed));
    assert.equal(r.whole,r.small+r.remaining);assert.equal(r.height*r.whole,r.solution*r.small);
    assert.ok(r.height<r.small);
  }
  assert.throws(()=>generateRamp(-1));
});
test('V/F needs truth and justification; valid independent evidence changes mastery atomically',()=>{
  const p=fresh();const step=getEvaluationSteps(0,0)[0];
  const missing=recordEvaluationResponse(p,[step.answer[0]],0);
  assert.equal(missing.evaluationSession.attempts[0].correct,false);
  const next=recordEvaluationResponse(p,step.answer,1);
  assert.equal(next.evaluationSession.attempts[0].hintsUsed,0);
  assert.deepEqual(next.evaluationSession.attempts[0].response,step.answer);
  assert.equal(next.evaluationSession.attempts[0].independence,1);
  assert.ok(next.mastery.fundamentals>0);
  assert.equal(Object.values(next.questions)[0].attempts,1);
  assert.equal(recordEvaluationResponse(next,step.answer,2),next);
});
test('hints persist and correctness with help does not award independent mastery',()=>{
  const p=fresh();p.evaluationSession.hintsUsed=1;
  const next=recordEvaluationResponse(p,getEvaluationSteps(0,0)[0].answer,1);
  assert.equal(next.evaluationSession.attempts[0].correct,true);
  assert.equal(next.evaluationSession.attempts[0].hintsUsed,1);
  assert.equal(next.mastery.fundamentals,0);
  assert.deepEqual(migrateProgress(JSON.parse(JSON.stringify(next))).evaluationSession,next.evaluationSession);
});
test('medians and altitudes require six construction actions, including midpoint and perpendicular foot',()=>{
  const steps=getEvaluationSteps(1,0);
  assert.equal(steps.filter(s=>s.kind==='construction').length,6);
  assert.deepEqual(steps.map(s=>s.effect),['opposite','midpoint','median','support','foot','altitude']);
  assert.notDeepEqual(getEvaluationSteps(1,1).map(s=>s.id),steps.map(s=>s.id));
});
test('entire campaign and boss complete with transfer and persistent position, evidence and cooldown',()=>{
  let p={...migrateProgress(initialProgress),evaluationSession:createEvaluationSession('whole')};
  let count=0;const ids=[];
  while(p.evaluationSession.phase!=='done'&&count++<300){
    const s=p.evaluationSession;
    if(s.phase==='content')p={...p,evaluationSession:startEvaluationNode(s)};
    else if(s.phase==='feedback'||s.phase==='checkpoint')p={...p,evaluationSession:advanceEvaluation(s)};
    else{
      const step=getEvaluationSteps(s.nodeIndex,s.variant)[s.stepIndex];ids.push(step.id);
      p=recordEvaluationResponse(p,step.answer,count);
    }
    p=migrateProgress(JSON.parse(JSON.stringify(p)));
  }
  assert.equal(p.evaluationSession.phase,'done');
  assert.equal(p.evaluationSession.completedNodeIds.length,6);
  assert.deepEqual(evaluationMetrics(p.evaluationSession),{content:100,practiced:100,mastery:100,mastered:6,completion:100});
  assert.equal(new Set(ids).size,ids.length);
  assert.ok(p.evaluationSession.attempts.every(a=>a.hintsUsed===0));
  assert.equal(p.evaluationSession.recentlySeenChallengeIds.length,5);
  assert.ok(p.mastery.isosceles>0);
});
test('all-wrong campaign is bounded, varies questions, communicates remediation and grants no mastery',()=>{
  let s=createEvaluationSession('wrong');let count=0;
  while(s.phase!=='done'&&count++<400){
    if(s.phase==='content')s=startEvaluationNode(s);
    else if(s.phase==='feedback'||s.phase==='checkpoint')s=advanceEvaluation(s);
    else s=answerEvaluation(s,getEvaluationSteps(s.nodeIndex,s.variant)[s.stepIndex],['wrong']);
  }
  assert.equal(s.phase,'done');assert.equal(evaluationMetrics(s).mastered,0);
  assert.ok(s.attempts.some(a=>a.variant===2));
  assert.equal(new Set(s.attempts.map(a=>a.challengeId)).size,s.attempts.length);
});
test('session schema rejects incompatible or inconsistent progress instead of silently resetting it',()=>{
  const s=startEvaluationNode(createEvaluationSession('schema'));assert.equal(validateEvaluationSession(s),true);
  for(const patch of [{version:3},{nodeIndex:9},{stepIndex:999},{phase:'feedback'},{response:null}]){
    assert.equal(validateEvaluationSession({...s,...patch}),false);
    assert.throws(()=>migrateProgress({...initialProgress,evaluationSession:{...s,...patch}}));
  }
});
test('general scheduler cools recent activity and picks another eligible variant',()=>{
  const pool=Array.from({length:12},(_,i)=>({id:`item-${i}`,skillId:'fundamentals',prompt:'test',kind:'true-false',options:['true','false'],correctIndex:0,explanation:'test'}));
  const p=migrateProgress(initialProgress);const first=createSession(pool,p,1);const last=first.queue.at(-1).questionId;
  p.trainingSession={...first,completed:true,index:first.queue.length};p.sessionCount=1;
  p.questions[last]={attempts:1,correct:0,errors:1,exposures:1,lastSeen:1,lastResult:false,dueAt:0,intervalDays:0};
  const next=createSession(pool,p,2);
  assert.notEqual(next.queue[0].questionId,last);
  assert.ok(!next.queue.some(q=>q.questionId===last));
});
test('scope covers all six source families and all variants use unique IDs with valid answers',()=>{
  assert.equal(evaluationNodes.length,6);
  const ids=[];
  for(let node=0;node<6;node++)for(let variant=0;variant<3;variant++)for(const step of getEvaluationSteps(node,variant)){
    ids.push(step.id);assert.ok(step.explanation);assert.ok(step.hint);
    if(step.kind!=='number')assert.ok(step.options.includes(step.answer[0]));
    if(step.kind==='vf')assert.ok(step.reasons.includes(step.answer[1]));
  }
  assert.equal(new Set(ids).size,ids.length);
});
