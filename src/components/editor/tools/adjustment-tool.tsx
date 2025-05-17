"use client";

import { useState } from "react";
import { Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { createImageEdit } from "@/lib/image-editor";
import { ImageEdit } from "@/types";

interface AdjustmentToolProps {
  onApply: (edit: ImageEdit) => void;
}

export function AdjustmentTool({ onApply }: AdjustmentToolProps) {
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blur, setBlur] = useState(0);

  function handleApply() {
    // Only apply if at least one adjustment is non-zero
    if (brightness === 0 && contrast === 0 && saturation === 0 && blur === 0) {
      return;
    }
    
    const adjustments = [];
    if (brightness !== 0) adjustments.push(`Brightness: ${brightness}`);
    if (contrast !== 0) adjustments.push(`Contrast: ${contrast}`);
    if (saturation !== 0) adjustments.push(`Saturation: ${saturation}`);
    if (blur !== 0) adjustments.push(`Blur: ${blur}`);
    
    const edit = createImageEdit(
      "adjustment",
      {
        brightness,
        contrast,
        saturation,
        blur,
      },
      `Adjustments: ${adjustments.join(", ")}`
    );
    
    onApply(edit);
  }

  function handleReset() {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setBlur(0);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="brightness">Brightness</Label>
          <span className="text-sm">{brightness}</span>
        </div>
        <Slider
          id="brightness"
          min={-100}
          max={100}
          step={1}
          value={[brightness]}
          onValueChange={(value) => setBrightness(value[0])}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="contrast">Contrast</Label>
          <span className="text-sm">{contrast}</span>
        </div>
        <Slider
          id="contrast"
          min={-100}
          max={100}
          step={1}
          value={[contrast]}
          onValueChange={(value) => setContrast(value[0])}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="saturation">Saturation</Label>
          <span className="text-sm">{saturation}</span>
        </div>
        <Slider
          id="saturation"
          min={-100}
          max={100}
          step={1}
          value={[saturation]}
          onValueChange={(value) => setSaturation(value[0])}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="blur">Blur</Label>
          <span className="text-sm">{blur}</span>
        </div>
        <Slider
          id="blur"
          min={0}
          max={20}
          step={0.5}
          value={[blur]}
          onValueChange={(value) => setBlur(value[0])}
        />
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={handleReset} 
          className="flex-1"
        >
          Reset
        </Button>
        <Button 
          onClick={handleApply} 
          className="flex-1"
          disabled={brightness === 0 && contrast === 0 && saturation === 0 && blur === 0}
        >
          <Sliders className="h-4 w-4 mr-2" />
          Apply
        </Button>
      </div>
    </div>
  );
}
