"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createImageEdit, getFilterName } from "@/lib/image-editor";
import { ImageEdit, ImageFilterType } from "@/types";

interface FilterToolProps {
  onApply: (edit: ImageEdit) => void;
}

export function FilterTool({ onApply }: FilterToolProps) {
  const [filterType, setFilterType] = useState<ImageFilterType>("none");
  const [intensity, setIntensity] = useState(100);

  function handleApply() {
    if (filterType === "none") return;
    
    const edit = createImageEdit(
      "filter",
      {
        filterType,
        intensity,
      },
      `Filter: ${getFilterName(filterType)} (${intensity}%)`
    );
    
    onApply(edit);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Filter Type</Label>
        <RadioGroup
          value={filterType}
          onValueChange={(value) => setFilterType(value as ImageFilterType)}
          className="grid grid-cols-2 gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none" className="cursor-pointer">None</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="grayscale" id="grayscale" />
            <Label htmlFor="grayscale" className="cursor-pointer">Grayscale</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sepia" id="sepia" />
            <Label htmlFor="sepia" className="cursor-pointer">Sepia</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="invert" id="invert" />
            <Label htmlFor="invert" className="cursor-pointer">Invert</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vintage" id="vintage" />
            <Label htmlFor="vintage" className="cursor-pointer">Vintage</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="blueprint" id="blueprint" />
            <Label htmlFor="blueprint" className="cursor-pointer">Blueprint</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="noir" id="noir" />
            <Label htmlFor="noir" className="cursor-pointer">Noir</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="intensity">Intensity</Label>
          <span className="text-sm">{intensity}%</span>
        </div>
        <Slider
          id="intensity"
          min={0}
          max={100}
          step={1}
          value={[intensity]}
          onValueChange={(value) => setIntensity(value[0])}
          disabled={filterType === "none"}
        />
      </div>
      
      <Button 
        onClick={handleApply} 
        className="w-full"
        disabled={filterType === "none"}
      >
        <ImageIcon className="h-4 w-4 mr-2" />
        Apply Filter
      </Button>
    </div>
  );
}
