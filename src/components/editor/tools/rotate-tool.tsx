"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { createImageEdit } from "@/lib/image-editor";
import { ImageEdit } from "@/types";

interface RotateToolProps {
  onApply: (edit: ImageEdit) => void;
}

export function RotateTool({ onApply }: RotateToolProps) {
  const [angle, setAngle] = useState(0);

  function handleApply() {
    const edit = createImageEdit(
      "rotate",
      {
        angle,
      },
      `Rotate (${angle}°)`
    );
    
    onApply(edit);
  }

  function handleQuickRotate(degrees: number) {
    setAngle(degrees);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="angle">Rotation Angle (degrees)</Label>
        <div className="flex items-center space-x-2">
          <Slider
            id="angle"
            min={-180}
            max={180}
            step={1}
            value={[angle]}
            onValueChange={(value) => setAngle(value[0])}
          />
          <Input
            type="number"
            value={angle}
            onChange={(e) => setAngle(parseInt(e.target.value) || 0)}
            className="w-20"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickRotate(-90)}
        >
          -90°
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickRotate(-45)}
        >
          -45°
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickRotate(45)}
        >
          +45°
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickRotate(90)}
        >
          +90°
        </Button>
      </div>
      
      <Button onClick={handleApply} className="w-full">
        <RotateCw className="h-4 w-4 mr-2" />
        Apply Rotation
      </Button>
    </div>
  );
}
