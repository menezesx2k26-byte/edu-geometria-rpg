import type { Question } from "../types/geometry";
export function GeometryFigure({
  kind,
  labels,
}: {
  kind: Question["figure"];
  labels?: string[];
}) {
  if (!kind) return null;
  const crossing = ["opv", "ala", "lal"].includes(kind);
  const names =
    labels ??
    (kind === "opv"
      ? ["A", "B", "O", "C", "D"]
      : kind === "lal"
        ? ["A", "B", "F", "R", "H"]
        : ["A", "B", "C", "D", "E"]);
  return (
    <figure className="geometry-figure">
      <svg
        viewBox="0 0 260 220"
        role="img"
        aria-label={
          crossing
            ? "Duas retas com semirretas opostas; marcas indicam as hipóteses"
            : "Triângulo com vértices nomeados; somente as marcas indicam congruência"
        }
      >
        <g fill="none" stroke="currentColor" strokeWidth="2">
          {crossing ? (
            <>
              <path d="M25 25 L235 195 M235 25 L25 195" />
              {kind !== "opv" && (
                <>
                  <path d="M25 25 L235 25 M25 195 L235 195" />
                  {kind === "lal" && (
                    <path d="M70 71.7 L80 59.3 M180 160.7 L190 148.3" />
                  )}
                  {kind === "lal" ? (
                    <path d="M180 59.3 L190 71.7 M173 64.9 L183 77.3 M70 148.3 L80 160.7 M77 142.7 L87 155.1" />
                  ) : (
                    <>
                      <path d="M180 59.3 L190 71.7 M70 148.3 L80 160.7" />
                      <path d="M210 25 Q208 35 216 40 M49 181 Q53 187 49 195" />
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              <path d="M100 22 L28 190 L232 190 Z" />
              {kind === "isosceles" && (
                <path d="M59 105 L71 111 M160 108 L173 99" />
              )}
              {kind === "median" && (
                <>
                  <path d="M100 22 L130 190" />
                  <path d="M77 184 L77 196 M181 184 L181 196" />
                </>
              )}
            </>
          )}
        </g>
        <g fill="currentColor" fontSize="16" fontFamily="sans-serif">
          {crossing ? (
            <>
              <text x="10" y="21">
                {names[0]}
              </text>
              <text x="237" y="21">
                {names[1]}
              </text>
              <text x="125" y="108">
                {names[2]}
              </text>
              <text x="10" y="215">
                {names[3]}
              </text>
              <text x="238" y="215">
                {names[4]}
              </text>
            </>
          ) : (
            <>
              <text x="94" y="16">
                {names[0]}
              </text>
              <text x="12" y="206">
                {names[1]}
              </text>
              <text x="233" y="206">
                {names[2]}
              </text>
              {kind === "median" && (
                <text x="125" y="210">
                  D
                </text>
              )}
            </>
          )}
        </g>
      </svg>
      <figcaption>
        Figura ilustrativa. As marcas e hipóteses justificam.
      </figcaption>
    </figure>
  );
}
