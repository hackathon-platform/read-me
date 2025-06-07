"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
          {project.media && project.media.length > 0 && (
            <div className="relative px-3">
              {project.media.length > 1 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {project.media.map((media, mediaIndex) => (
                      <CarouselItem key={mediaIndex}>
                        <div className="relative aspect-video">
                          {media.type === "image" ? (
                            <Image
                              src={media.url}
                              alt={`${project.title} - メディア ${mediaIndex + 1}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <video
                              src={media.url}
                              controls
                              autoPlay
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              ) : (
                <div className="relative aspect-video">
                  {project.media[0].type === "image" ? (
                    <Image
                      src={project.media[0].url}
                      alt={`${project.title} - メディア`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <video
                      src={project.media[0].url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          )}
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
            <CardDescription>{project.description}</CardDescription>
            {project.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {project.skills.map((skill, skillIndex) => (
                  <Badge
                    key={skillIndex}
                    variant={
                      skill.type === "language" || skill.type === "framework"
                        ? "default"
                        : skill.type === "tool"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {skill.name}
                  </Badge>
                ))}
              </div>
            )}
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
