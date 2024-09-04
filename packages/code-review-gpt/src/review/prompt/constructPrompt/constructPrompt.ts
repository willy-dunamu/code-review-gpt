import { changedLinesIntoBatches } from "./batchFiles/changedLines";
import { costOptimizedChangedLinesIntoBatches } from "./batchFiles/costOptimizedChangedLines";
import { fullFilesIntoBatches } from "./batchFiles/fullFiles";
import { PromptFile, ReviewFile } from "../../../common/types";
import { getLanguageName } from "../getLanguageOfFile";
import { instructionPrompt } from "../prompts";

export const constructPromptsArray = (
  files: ReviewFile[],
  maxPromptLength: number,
  reviewType: string
): string[] => {
  const maxPromptPayloadLength = maxPromptLength - instructionPrompt.length;
  let promptPayloads: PromptFile[][];

  switch (reviewType) {
    case "full":
      promptPayloads = fullFilesIntoBatches(files, maxPromptPayloadLength);
      break;
    case "changed":
      promptPayloads = changedLinesIntoBatches(files, maxPromptPayloadLength);
      break;
    case "costOptimized":
      promptPayloads = costOptimizedChangedLinesIntoBatches(
        files,
        maxPromptPayloadLength
      );
      break;

    default:
      throw new Error(
        `Review type ${reviewType} is not supported. Please use one of the following: full, changed, costOptimized.`
      );
  }

  const languageToInstructionPrompt = instructionPrompt.replace(
    "{Language}",
    getLanguageName(files[0].fileName) //assume the first file is representative of the language
  );

  const answerLanguage = process.env.LANGUAGE
    ? `, Answer me in Korean, 답변은 한글로 달아줘`
    : '';

  const prompts = promptPayloads.map((payload) => {
    return languageToInstructionPrompt + JSON.stringify(payload);
  });

  return [...prompts, answerLanguage];
};
