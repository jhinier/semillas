import { Card } from "@/componentes/ui/card-base";
import { FormularioGeneral } from "./formulario-general";
import { VistaPreviaRapida } from "./vista-previa-rapida";

type TabGeneralProps = {
  title: string;
  onTitleChange: (v: string) => void;
  targetAudience: string;
  onTargetAudienceChange: (v: string) => void;
  shortDesc: string;
  onShortDescChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  keyVerse: string;
  onKeyVerseChange: (v: string) => void;
  duration: number;
  onDurationChange: (v: number) => void;
  mainMessage: string;
  onMainMessageChange: (v: string) => void;
  tagsList: string[];
  onTagsChange: (v: string[]) => void;
  previewImageUrl?: string | null;
};

export function TabGeneral({
  title,
  onTitleChange,
  targetAudience,
  onTargetAudienceChange,
  shortDesc,
  onShortDescChange,
  category,
  onCategoryChange,
  keyVerse,
  onKeyVerseChange,
  duration,
  onDurationChange,
  mainMessage,
  onMainMessageChange,
  tagsList,
  onTagsChange,
  previewImageUrl,
}: TabGeneralProps) {
  return (
    <>
      <Card sombra="sm">
        <FormularioGeneral
          title={title}
          onTitleChange={onTitleChange}
          targetAudience={targetAudience}
          onTargetAudienceChange={onTargetAudienceChange}
          shortDesc={shortDesc}
          onShortDescChange={onShortDescChange}
          category={category}
          onCategoryChange={onCategoryChange}
          keyVerse={keyVerse}
          onKeyVerseChange={onKeyVerseChange}
          duration={duration}
          onDurationChange={onDurationChange}
          mainMessage={mainMessage}
          onMainMessageChange={onMainMessageChange}
          tagsList={tagsList}
          onTagsChange={onTagsChange}
        />
      </Card>

      <Card sombra="sm">
        <VistaPreviaRapida
          title={title}
          category={category}
          targetAudience={targetAudience}
          shortDesc={shortDesc}
          mainMessage={mainMessage}
          keyVerse={keyVerse}
          duration={duration}
          previewImageUrl={previewImageUrl}
        />
      </Card>
    </>
  );
}
