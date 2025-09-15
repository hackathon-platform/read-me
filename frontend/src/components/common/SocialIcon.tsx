import { Social } from "@/lib/types";
import { Github, Linkedin, Instagram, Facebook, Link } from "lucide-react";

export const platformEnum = [
  "github",
  "linkedin",
  "instagram",
  "facebook",
  "other",
] as const;

export const getSocialIcon = (social: Social) => {
  switch (social.platform) {
    case "github":
      return <Github className="h-4 w-4" />;
    case "linkedin":
      return <Linkedin className="h-4 w-4" />;
    case "instagram":
      return <Instagram className="h-4 w-4" />;
    case "facebook":
      return <Facebook className="h-4 w-4" />;
    case "other":
      return <Link className="h-4 w-4" />;
  }
};
