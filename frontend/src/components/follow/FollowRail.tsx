"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SuggestList } from "./SuggestList";

export function FollowRail() {
  return (
    <>
      {/* lg+ : right rail (vertical list) */}
      <div className="hidden lg:block space-y-4">
        <section>
          <h3 className="text-sm font-semibold mb-2">おすすめユーザー</h3>
          <SuggestList variant="rail" />
        </section>
      </div>

      {/* < lg : accordion (horizontal carousel) */}
      <div className="lg:hidden">
        <Accordion type="single" collapsible>
          <AccordionItem value="suggest">
            <AccordionTrigger className="pt-1">
              おすすめユーザー
            </AccordionTrigger>
            <AccordionContent>
              <SuggestList variant="carousel" />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
