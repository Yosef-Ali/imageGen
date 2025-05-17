"use client";

import { useState } from "react";
import { Crop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { createImageEdit } from "@/lib/image-editor";
import { ImageEdit } from "@/types";

interface CropToolProps {
  onApply: (edit: ImageEdit) => void;
}

export function CropTool({ onApply }: CropToolProps) {
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(100);
  const [cropHeight, setCropHeight] = useState(100);

  function handleApply() {
    const edit = createImageEdit(
      "crop",
      {
        cropX,
        cropY,
        cropWidth,
        cropHeight,
      },
      `Crop (${cropWidth}x${cropHeight} from ${cropX},${cropY})`
    );
    
    onApply(edit);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="crop-x">X Position</Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="crop-x"
            min={0}
            max={500}
            step={1}
            value={[cropX]}
            onValueChange={(value) => setCropX(value[0])}
          />
          <Input
            type="number"
            value={cropX}
            onChange={(e) => setCropX(parseInt(e.target.value) || 0)}
            className="w-20"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="crop-y">Y Position</Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="crop-y"
            min={0}
            max={500}
            step={1}
            value={[cropY]}
            onValueChange={(value) => setCropY(value[0])}
          />
          <Input
            type="number"
            value={cropY}
            onChange={(e) => setCropY(parseInt(e.target.value) || 0)}
            className="w-20"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="crop-width">Width</Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="crop-width"
            min={10}
            max={1000}
            step={1}
            value={[cropWidth]}
            onValueChange={(value) => setCropWidth(value[0])}
          />
          <Input
            type="number"
            value={cropWidth}
            onChange={(e) => setCropWidth(parseInt(e.target.value) || 10)}
            className="w-20"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="crop-height">Height</Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="crop-height"
            min={10}
            max={1000}
            step={1}
            value={[cropHeight]}
            onValueChange={(value) => setCropHeight(value[0])}
          />
          <Input
            type="number"
            value={cropHeight}
            onChange={(e) => setCropHeight(parseInt(e.target.value) || 10)}
            className="w-20"
          />
        </div>
      </div>
      
      <Button onClick={handleApply} className="w-full">
        <Crop className="h-4 w-4 mr-2" />
        Apply Crop
      </Button>
    </div>
  );
}
