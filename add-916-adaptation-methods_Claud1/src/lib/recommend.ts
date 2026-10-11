// Логика рекомендации метода — основана на ролях/медиа (как в исходной
// программе для 4 базовых методов) и расширена типом структуры шаблона для
// новых методов. Рекомендация не выбирает метод автоматически за пользователя —
// это только подсказка в панели.
import type { ParsedTemplate, TemplateDef } from "./types";

export interface Recommendation {
  methodId: string;
  reason: string;
}

export function recommend(tpl: TemplateDef, parsed: ParsedTemplate): Recommendation {
  const { mediaCount, roleCount } = parsed;

  switch (tpl.kind) {
    case "typographic":
      return {
        methodId: "typographic",
        reason: "Крупное высказывание и почти нет медиа — типографике нужен масштаб, а не композиция вокруг картинки.",
      };
    case "hero-media":
      if (mediaCount === 1 && roleCount <= 4) {
        return {
          methodId: "heroMedia",
          reason: "Одно доминирующее медиа и короткий текст — full-bleed герой выразительнее, чем медиа в рамке.",
        };
      }
      return {
        methodId: "smart",
        reason: `Есть семантические роли и медиа (ролей: ${roleCount}; медиа: ${mediaCount}) — стоит перекомпоновать по смыслу.`,
      };
    case "multi-media":
      return {
        methodId: "mediaGrid",
        reason: `Обнаружено медиа-блоков: ${mediaCount}. В оригинале они стоят рядом по горизонтали — вертикальная медиасетка распределит их по высоте вместо стека сверху.`,
      };
    case "text-split":
      return {
        methodId: "compact",
        reason: "У шаблона уже есть достаточно простая горизонтальная структура без медиа; безопаснее сначала уплотнить исходную сетку и типографику.",
      };
    case "longform":
      return {
        methodId: "editorial",
        reason: "Длинный текстовый блок рискует собраться вверху кадра — редакционная композиция распределит его по высоте.",
      };
    case "cards":
      return {
        methodId: "balanced",
        reason: "Повторяющийся набор карточек/строк — сбалансированная композиция считает вес блока-повтора целиком и держит ритм без пустот внизу кадра.",
      };
    default:
      return { methodId: "smart", reason: "Рекомендация по умолчанию: реконструкция по ролям." };
  }
}
