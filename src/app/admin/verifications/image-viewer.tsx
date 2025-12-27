"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageViewerProps {
  src: string;
  alt: string;
  label: string;
}

export function ImageViewer({ src, alt, label }: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div 
        className="relative aspect-video bg-black/10 rounded-lg overflow-hidden border group cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <Image 
          src={src} 
          alt={alt} 
          fill 
          className="object-cover transition-transform group-hover:scale-105" 
        />
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-2 py-1 flex justify-between items-center">
          <span>{label}</span>
          <span className="text-[10px] opacity-70">Click to enlarge</span>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full min-h-[400px]">
            <Image 
              src={src} 
              alt={alt} 
              fill
              className="object-contain" 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
