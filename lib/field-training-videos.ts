/**
 * Curated, embed-friendly public videos on good agricultural practice (reputable
 * international sources; replace with local extension content for production).
 */
export type TrainingVideo = {
  id: string;
  title: string;
  /** Short blurb for the field UI */
  blurb: string;
  source: string;
};

export const TRAINING_VIDEOS: TrainingVideo[] = [
  {
    id: "KYeFNnPJVEg",
    title: "Climate-smart agriculture",
    blurb:
      "How agriculture can adapt to climate change, raise productivity responsibly, and support food security (FAO policy explainer).",
    source: "FAO of the UN",
  },
  {
    id: "tk95ZFISjU4",
    title: "Sustainable intensification of agriculture",
    blurb:
      "Producing more food from the same land with fewer resource losses—why efficiency and policy matter for smallholders.",
    source: "FAO of the UN",
  },
  {
    id: "WeoIsjYBQH0",
    title: "Sustainable food and agriculture",
    blurb:
      "Soil, biodiversity, and livelihoods: why “more sustainable” farming systems need aligned policies and institutions.",
    source: "FAO of the UN",
  },
];

export function trainingEmbedUrl(youtubeId: string) {
  return `https://www.youtube-nocookie.com/embed/${youtubeId}`;
}

export function trainingWatchUrl(youtubeId: string) {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}
