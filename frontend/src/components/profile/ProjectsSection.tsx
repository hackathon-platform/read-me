"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Project } from "@/lib/types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (!projects?.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm">
            プロジェクトが設定されていません。
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      {projects.map((project, index) => (
        <Card key={index} className="overflow-hidden">
          {/* Media carousel */}
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
            <CardDescription>{project.description}</CardDescription>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {project.skills.map((skill, i) => (
                <Badge key={i} variant="default">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </CardHeader>
          {project.url && (
            <CardFooter>
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  プロジェクトを見る
                </Button>
              </a>
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
