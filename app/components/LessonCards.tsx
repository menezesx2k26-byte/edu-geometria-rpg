"use client";

import { AlertTriangle, BookOpen, Crown, FlaskConical, Gem, Lightbulb, Scale } from "lucide-react";
import Image from "next/image";
import type { LessonBlock, LessonBlockType } from "../types/geometry";
import { getAsset } from "../lib/assets";
import { Math } from "./Math";

const iconMap: Record<LessonBlockType, typeof BookOpen> = {
  definition: BookOpen,
  postulate: Gem,
  theorem: Crown,
  corollary: Gem,
  proposition: Scale,
  example: Lightbulb,
  warning: AlertTriangle,
  comparison: FlaskConical,
};

const labels: Record<LessonBlockType, string> = {
  definition: "Definição",
  postulate: "Postulado",
  theorem: "Teorema",
  corollary: "Corolário",
  proposition: "Proposição",
  example: "Exemplo",
  warning: "Atenção",
  comparison: "Comparação",
};

export function LessonCard({ block }: { block: LessonBlock }) {
  const Icon = iconMap[block.type];
  const asset = getAsset(block.asset);
  return (
    <article className={`lesson-card lesson-card--${block.type}`}>
      <div className="lesson-card__heading">
        <span className="lesson-card__icon"><Icon size={20} aria-hidden="true" /></span>
        <div><p className="eyebrow">{labels[block.type]}</p><h2>{block.title}</h2></div>
      </div>
      {asset && <div className="lesson-card__asset"><Image src={asset} width={512} height={510} alt={`Ilustração: ${block.title}`} /></div>}
      <div className="lesson-card__content">
        {block.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {block.formulas?.map((formula) => <Math key={formula} display>{formula}</Math>)}
        {block.callout && <aside className="lesson-card__callout"><AlertTriangle size={18} aria-hidden="true" /><span>{block.callout}</span></aside>}
      </div>
    </article>
  );
}
