import type { ConvertResult, MethodId, TemplateMeta } from "./types";
import { analyzeHtml } from "./analyze";
import { convertSmart, convertCompact, convertSplit, convertFit } from "./methodsLegacy";
import {
  convertEditorial,
  convertHero,
  convertMediaStack,
  convertBalanced,
  convertType,
} from "./methodsNew";
import { buildDocument, parseFragment, innerBody, pickBg } from "./html";

export function convertFromOriginal(
  sourceHtml: string,
  method: MethodId,
  tpl?: TemplateMeta
): ConvertResult {
  const profile = analyzeHtml(sourceHtml, tpl);
  try {
    switch (method) {
      case "smart":
        return convertSmart(sourceHtml, profile, tpl);
      case "compact":
        return convertCompact(sourceHtml, profile);
      case "split":
        return convertSplit(sourceHtml, profile);
      case "fit":
        return convertFit(sourceHtml, profile);
      case "editorial":
        return convertEditorial(sourceHtml, profile);
      case "hero":
        return convertHero(sourceHtml, profile);
      case "mediastack":
        return convertMediaStack(sourceHtml, profile);
      case "balanced":
        return convertBalanced(sourceHtml, profile);
      case "type":
        return convertType(sourceHtml, profile);
      default:
        return convertFit(sourceHtml, profile);
    }
  } catch (err) {
    const doc = parseFragment(sourceHtml);
    const html = innerBody(doc);
    const bg = pickBg(doc);
    return {
      html,
      css: "",
      document: buildDocument(html, "", 900, bg),
      method,
      handler: profile.handler,
      analysis: profile,
      notes: [`Ошибка нового/текущего метода, показан исходник: ${(err as Error).message}`],
    };
  }
}

export function sourceDocument(html: string): string {
  const doc = parseFragment(html);
  return buildDocument(innerBody(doc), "", 1440, pickBg(doc));
}
