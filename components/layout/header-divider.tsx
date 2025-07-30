import { MainContainer } from "./main-container";
import { Separator } from "@/components/ui/separator";

export function HeaderDivider() {
  return (
    <MainContainer>
      <div className="pt-3 pb-3">
        <Separator className="h-[2px]" />
      </div>
    </MainContainer>
  );
}