import { evaluationNames, generateRamp, getEvaluationSteps, type EvaluationStep } from '../content/evaluationTrail';
import type { EvaluationSession } from '../types/evaluation';

type Point = readonly [number, number];
const midpoint = (a: Point, b: Point): Point => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
function Segment({ a, b, accent = false, dashed = false }: { a: Point; b: Point; accent?: boolean; dashed?: boolean }) {
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className={accent ? 'is-accent' : ''} strokeDasharray={dashed ? '5 5' : undefined} />;
}
function Dot({ point, label, dx = 0, dy = -10 }: { point: Point; label: string; dx?: number; dy?: number }) {
  return <g><circle cx={point[0]} cy={point[1]} r="3" /><text x={point[0] + dx} y={point[1] + dy} textAnchor="middle">{label}</text></g>;
}
function Polygon({ points }: { points: Point[] }) {
  return <polygon points={points.map(point => point.join(',')).join(' ')} />;
}

export function EvaluationFigure({ session, step }: { session: EvaluationSession; step?: EvaluationStep | undefined }) {
  const [a, b, c, d, o] = evaluationNames(session.variant);
  const completed = getEvaluationSteps(session.nodeIndex, session.variant).filter(item =>
    session.attempts.some(attempt => attempt.challengeId === item.id && attempt.correct));
  const has = (effect: string) => completed.some(item => item.effect === effect);
  let figure;
  let caption = '';
  if (session.nodeIndex === 0) {
    const shape = step?.shape ?? 'square';
    const points: Point[] = shape === 'equilateral' ? [[180,35],[76,215],[284,215]]
      : shape === 'trapezoid' ? [[110,70],[250,70],[305,205],[55,205]]
      : shape === 'rhombus' ? [[180,30],[310,130],[180,230],[50,130]]
      : shape === 'rectangle' ? [[60,80],[300,80],[300,200],[60,200]]
      : [[100,45],[280,45],[280,225],[100,225]];
    figure = <><Polygon points={points} />{shape === 'rhombus' && <><Segment a={points[0]!} b={points[2]!} dashed /><Segment a={points[1]!} b={points[3]!} dashed /></>}
      {points.map((point, index) => <Dot key={index} point={point} label={'ABCD'[index]!} dy={index < 2 ? -12 : 18} />)}
      {shape === 'rectangle' && <><text x="180" y="65" textAnchor="middle">{session.variant + 4}</text><text x="320" y="145">{session.variant + 2}</text></>}
      {shape === 'trapezoid' && <><text x="175" y="92">∥</text><text x="175" y="196">∥</text></>}
      {shape === 'equilateral' && <text x="180" y="250" textAnchor="middle">AB = BC = CA</text>}</>;
    caption = 'Use a definição e as propriedades declaradas; medidas ou orientação do desenho não são hipóteses.';
  } else if (session.nodeIndex === 1) {
    const A: Point = session.variant ? [60,45] : [160,45];
    const B: Point = session.variant ? [140,210] : [45,210];
    const C: Point = [300,210];
    const M = midpoint(A, B);
    const H: Point = [A[0],B[1]];
    const m = session.variant === 0 ? 'M' : session.variant === 1 ? 'N' : 'F';
    figure = <><Polygon points={[A,B,C]} />
      {has('opposite') && <Segment a={A} b={B} accent />}
      {has('midpoint') && <><Dot point={M} label={m} dx={-16} /><text x="190" y="252" textAnchor="middle">{a}{m} = {m}{b}</text></>}
      {has('median') && <Segment a={C} b={M} accent />}
      {has('support') && <Segment a={[30,210]} b={[330,210]} dashed />}
      {has('foot') && <><Dot point={H} label="H" dy={20} /><path d={`M ${H[0]+10},${H[1]} v -10 h -10`} /></>}
      {has('altitude') && <Segment a={A} b={H} accent />}
      <Dot point={A} label={a} /><Dot point={B} label={b} dy={18} dx={-12} /><Dot point={C} label={c} dy={18} dx={10} /></>;
    caption = session.variant ? 'Triângulo obtusângulo: o pé H está no prolongamento do lado, fora do segmento.' : 'A figura registra cada construção que você validou.';
  } else if (session.nodeIndex === 2 || session.nodeIndex === 3) {
    const points: Point[] = session.nodeIndex === 2 ? [[65,45],[305,85],[270,210],[30,170]] : [[50,60],[305,40],[275,210],[80,195]];
    const O = midpoint(points[0]!, points[2]!);
    figure = <g transform={session.variant ? 'rotate(-8 180 130)' : undefined}><Polygon points={points} />
      <Segment a={points[0]!} b={points[2]!} accent /><Segment a={points[1]!} b={points[3]!} accent />
      {points.map((point, index) => <Dot key={index} point={point} label={[a,b,c,d][index]!} dx={index===0||index===3?-14:12} dy={index<2?-12:20} />)}
      {session.nodeIndex === 2 && <Dot point={O} label={o} dx={-10} dy={18} />}</g>;
    caption = session.nodeIndex === 2 ? `${a}${b} ∥ ${c}${d}; ${a}${d} ∥ ${b}${c}. As diagonais intersectam-se em ${o}.` : 'Quadrilátero simples, convexo e não degenerado nesta configuração. A prova não supõe lados iguais.';
  } else if (session.nodeIndex === 4) {
    const ramp = generateRamp(session.variant);
    const origin: Point = [35,215]; const top: Point = [310,40]; const foot: Point = [310,215];
    const fraction = ramp.small/ramp.whole;
    const smallTop: Point = [origin[0]+(top[0]-origin[0])*fraction,origin[1]+(top[1]-origin[1])*fraction];
    const smallFoot: Point = [smallTop[0],origin[1]];
    figure = <><Polygon points={[origin,top,foot]} /><Segment a={smallTop} b={smallFoot} accent />
      <text x={(origin[0]+smallTop[0])/2} y={(origin[1]+smallTop[1])/2-14} textAnchor="middle">{ramp.small} m</text>
      <text x="200" y="27" textAnchor="middle">{ramp.remaining} m restantes</text>
      <text x={smallFoot[0]+8} y={(smallTop[1]+smallFoot[1])/2}>{ramp.height} m</text><text x="323" y="133">h</text>
      <path d="M 298,215 v -12 h 12" /><Dot point={smallTop} label="P" dx={-8} />
      {has('whole') && <text x="180" y="253" textAnchor="middle">Rampa inteira: {ramp.whole} m</text>}</>;
    caption = 'Desenho esquemático: os comprimentos dados estão na rampa, as alturas são verticais.';
  } else {
    const A: Point=[180,30]; const B: Point=[35,220]; const C: Point=[325,220];
    const t=session.variant===0?.35:session.variant===1?.7:.45;
    const P: Point=[B[0]+(C[0]-B[0])*t,220];
    const E: Point=[A[0]+(B[0]-A[0])*(1-t),A[1]+(B[1]-A[1])*(1-t)];
    const D: Point=[A[0]+(C[0]-A[0])*t,A[1]+(C[1]-A[1])*t];
    const p=session.variant===0?'P':session.variant===1?'Q':'V';
    const e=session.variant===0?'E':session.variant===1?'F':'W';
    const f=session.variant===0?'D':session.variant===1?'G':'Z';
    figure=<><Polygon points={[A,B,C]} /><polygon className="boss-parallelogram" points={[A,E,P,D].map(point=>point.join(',')).join(' ')} />
      <Dot point={A} label={a}/><Dot point={B} label={b} dy={20}/><Dot point={C} label={c} dy={20}/>
      <Dot point={P} label={p} dy={20}/><Dot point={E} label={e} dx={-14} dy={0}/><Dot point={D} label={f} dx={14} dy={0}/>
      <text x="180" y="255" textAnchor="middle">{a}{b} = {a}{c}</text></>;
    caption=`${p} é interior à base. ${e}${p} ∥ ${a}${c} e ${p}${f} ∥ ${a}${b}. A posição varia na transferência.`;
  }
  return <figure className="evaluation-figure"><svg viewBox="0 0 360 270" role="img" aria-label={caption}>{figure}</svg><figcaption>{caption}</figcaption></figure>;
}
